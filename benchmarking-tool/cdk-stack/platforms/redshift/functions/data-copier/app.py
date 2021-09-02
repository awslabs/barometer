import os
import boto3
import json
import traceback
from urllib.parse import urlparse

fn = boto3.client("lambda")
s3 = boto3.client("s3")
stack_name = os.environ["StackName"]
proxy_function_arn = os.environ["ProxyFunctionArn"]
query_function_arn = os.environ["QueryFunctionArn"]
redshift_copy_role_arn = os.environ["RedshiftCopyRoleArn"]


def lambda_handler(event, context):
    dataset = event["data"]["dataset"]
    secret_id = event["data"]["secretId"]
    session_id = event["data"]["sessionId"]

    # List tables to load
    s3_path = urlparse(dataset, allow_fragments=False)
    print("Querying folders from dataset: " + dataset)

    folders = []
    paginator = s3.get_paginator('list_objects')
    for result in paginator.paginate(Bucket=s3_path.netloc, Delimiter='/', Prefix=s3_path.path.lstrip('/')):
        for prefix in result.get('CommonPrefixes'):
            print("Processing: " + prefix.get('Prefix'))
            dirs = prefix.get('Prefix').split('/')
            folder = dirs[-2]
            if folder not in folders:
                # Remember folder & prepare the query
                folders.append(folder)
                query = "COPY " + folder + " FROM 's3://" + s3_path.netloc + "/" + prefix.get(
                    'Prefix') + "' iam_role '" + redshift_copy_role_arn + "' region '" + os.environ[
                            "AWS_REGION"] + "'"

                print("Submitting query: " + query + " User: " + secret_id)
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
                                      {"status": "FAILURE", "stackName": stack_name,
                                       "error": query_resp["errorMessage"], "cause": json.dumps(query_resp["cause"]),
                                       "lambdaFunction": os.environ["AWS_LAMBDA_FUNCTION_NAME"]}),
                                  'utf-8'))
                    return

    print("Notifying SUCCESS - " + proxy_function_arn + " Copy task completed.")
    fn.invoke(FunctionName=proxy_function_arn, InvocationType='Event',
              Payload=bytes(
                  json.dumps(
                      {"status": "SUCCESS", "stackName": stack_name,
                       "lambdaFunction": os.environ["AWS_LAMBDA_FUNCTION_NAME"]}),
                  'utf-8'))
