import json
import os
from urllib.parse import urlparse

import boto3

fn = boto3.client("lambda")
s3 = boto3.client("s3")
stack_name = os.environ["StackName"]
proxy_function_arn = os.environ["ProxyFunctionArn"]
query_function_arn = os.environ["QueryFunctionArn"]
redshift_copy_role_arn = os.environ["RedshiftCopyRoleArn"]


def lambda_handler(event, context):
    dataset = event["data"]["tableDataPath"]
    data_format = event["data"]["volume"]["format"].lower()
    secret_id = event["data"]["secretId"]
    session_id = event["data"]["sessionId"]
    proxy_token = event["proxyToken"]

    query_template = "COPY $table FROM '$path' iam_role '" + redshift_copy_role_arn + "'"

    if "compression" in event["data"]["volume"]:
        query_template += " " + event["data"]["volume"]["compression"]
    else:
        query_template += " FORMAT AS " + data_format
    if "delimiter" in event["data"]["volume"]:
        query_template += " DELIMITER AS '" + event["data"]["volume"]["delimiter"] + "'"
        query_template += " ACCEPTINVCHARS"

    print("Processing: " + dataset)
    dirs = dataset.split('/')
    table = dirs[-2]

    print("Table to load: " + table)
    query = query_template.replace("$table", table) \
        .replace("$path", dataset)

    print("Submitting query: " + query)
    payload = {
        "secretId": secret_id,
        "stackName": stack_name,
        "sessionId": session_id,
        "query": query
    }
    # Execute the query
    fn_response = fn.invoke(FunctionName=query_function_arn, Payload=bytes(json.dumps(payload), 'utf-8'))
    query_resp = json.loads(fn_response["Payload"].read().decode('utf-8'))
    print("Query response: " + json.dumps(query_resp) + " User: " + secret_id)

    if "errorMessage" in query_resp:
        print("Notifying FAILURE - " + proxy_function_arn + " Copy task failed.")
        fn.invoke(FunctionName=proxy_function_arn, InvocationType='Event',
                  Payload=bytes(
                      json.dumps(
                          {"status": "FAILURE", "stackName": stack_name, "proxyToken": proxy_token,
                           "error": query_resp["errorMessage"], "cause": json.dumps(query_resp["cause"]),
                           "lambdaFunction": os.environ["AWS_LAMBDA_FUNCTION_NAME"]}),
                      'utf-8'))
        return

    print("Notifying SUCCESS - " + proxy_function_arn + " Copy task completed.")
    fn.invoke(FunctionName=proxy_function_arn, InvocationType='Event',
              Payload=bytes(
                  json.dumps(
                      {"status": "SUCCESS", "stackName": stack_name, "proxyToken": proxy_token,
                       "lambdaFunction": os.environ["AWS_LAMBDA_FUNCTION_NAME"]}),
                  'utf-8'))
