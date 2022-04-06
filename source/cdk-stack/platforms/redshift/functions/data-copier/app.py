import json
import os
from urllib.parse import urlparse

import boto3

fn = boto3.client("lambda")
s3 = boto3.client("s3")
redshift = boto3.client("redshift-data")
secretsmanager = boto3.client('secretsmanager')
stack_name = os.environ["StackName"]
proxy_function_arn = os.environ["ProxyFunctionArn"]
redshift_copy_role_arn = os.environ["RedshiftCopyRoleArn"]


def lambda_handler(event, context):
    if "detail-type" in event:
        print("Received event: " + json.dumps(event))
        # Event is from events bridge so parse it
        detail = event["detail"]
        if detail["state"] == "FAILED" or detail["state"] == "ABORTED":
            resp = redshift.describe_statement(Id=detail["statementId"])
            print("ERROR: " + resp["Error"] + " Redshift query id - " + str(
                resp["RedshiftQueryId"]) + " Duration: " + str(
                resp["Duration"]))
            print("Notifying FAILURE - " + proxy_function_arn + " Copy task failed.")
            fn.invoke(FunctionName=proxy_function_arn, InvocationType='Event',
                      Payload=bytes(
                          json.dumps(
                              {"status": "FAILURE", "stackName": stack_name, "proxyToken": detail["statementName"],
                               "error": resp["Error"],
                               "cause": "Redshift query id - " + str(resp["RedshiftQueryId"]) + " Duration: " + str(
                                   resp["Duration"]),
                               "lambdaFunction": os.environ["AWS_LAMBDA_FUNCTION_NAME"]}),
                          'utf-8'))
            return

        print("Notifying SUCCESS - " + proxy_function_arn + " Copy task completed.")
        fn.invoke(FunctionName=proxy_function_arn, InvocationType='Event',
                  Payload=bytes(
                      json.dumps(
                          {"status": "SUCCESS", "stackName": stack_name, "proxyToken": detail["statementName"],
                           "lambdaFunction": os.environ["AWS_LAMBDA_FUNCTION_NAME"]}),
                      'utf-8'))
    else:
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

        # Fetch the secret
        secret = json.loads(secretsmanager.get_secret_value(SecretId=secret_id)["SecretString"])

        # Execute the query
        if "dbClusterIdentifier" in secret:
            resp = redshift.execute_statement(Database=secret["dbname"], SecretArn=secret_id,
                                              Sql=query, WithEvent=True,
                                              ClusterIdentifier=secret["dbClusterIdentifier"],
                                              StatementName=proxy_token)
        else:
            resp = redshift.execute_statement(Database=secret["dbname"], SecretArn=secret_id,
                                              Sql=query, WithEvent=True,
                                              StatementName=proxy_token)
        print("Running query with id - " + resp["Id"])
