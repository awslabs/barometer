import os
import boto3
import json
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
    object_paths = s3.list_objects_v2(Bucket=s3_path.netloc, Prefix=s3_path.path.lstrip('/'))
    folders = []
    for obj in object_paths["Contents"]:
        folder = os.path.dirname(obj["Key"])
        if folder not in folders:
            # Remember folder & prepare the query
            folders.append(folder)
            query = "COPY " + folder + " FROM s3://" + s3_path.netloc + "/" + obj[
                "Key"] + " iam_role '" + redshift_copy_role_arn + "' region '" + os.environ["AWS_REGION"] + "'"

            payload = {
                "secretId": secret_id,
                "stackName": stack_name,
                "sessionId": session_id,
                "query": query
            }
            # Execute the query
            fn.invoke(FunctionName=query_function_arn, Payload=bytes(json.dumps(payload), 'utf-8'))

    fn.invoke(FunctionName=query_function_arn, Payload=bytes(
        json.dumps(
            {"status": "SUCCESS", "stackName": stack_name, "lambdaFunction": os.environ["AWS_LAMBDA_FUNCTION_NAME"]}),
        'utf-8'))
