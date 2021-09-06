import boto3
from urllib.parse import urlparse

s3 = boto3.client("s3")


def list_s3_directories(params):
    base_path = params["basePath"]
    s3_path = urlparse(base_path, allow_fragments=False)
    response = {"paths": []}
    paginator = s3.get_paginator('list_objects')
    for result in paginator.paginate(Bucket=s3_path.netloc, Delimiter='/', Prefix=s3_path.path.lstrip('/')):
        for prefix in result.get('CommonPrefixes'):
            response["paths"].append("s3://" + s3_path.netloc + "/" + prefix.get('Prefix'))
    return response


def list_s3_paths(params):
    base_path = params["basePath"]
    extension = params["extension"]
    s3_path = urlparse(base_path, allow_fragments=False)
    response = {"paths": []}
    object_paths = s3.list_objects_v2(Bucket=s3_path.netloc, Prefix=s3_path.path.lstrip('/'))
    for obj in object_paths["Contents"]:
        if obj["Key"].endswith(extension):
            response["paths"].append("s3://" + s3_path.netloc + "/" + obj["Key"])
    return response


def get_user_session_as_map_items(params):
    session_count = params["sessionCount"]
    user_secrets = params["userSecrets"]["secretIds"]
    response = {"userSessions": []}
    for secret in user_secrets:
        for i in range(session_count):
            response["userSessions"].append({"secretId": secret, "sessionId": str(i + 1)})
    return response


def lambda_handler(event, context):
    if event["method"] == "listS3Paths":
        return list_s3_paths(event["parameters"])

    if event["method"] == "getUserSessionAsMapItems":
        return get_user_session_as_map_items(event["parameters"])

    if event["method"] == "listS3Directories":
        return list_s3_directories(event["parameters"])
