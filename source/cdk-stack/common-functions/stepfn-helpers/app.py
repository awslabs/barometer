import boto3
from urllib.parse import urlparse
import urllib3
import os

s3 = boto3.client("s3")
data_bucket = os.environ["DataBucketName"]


def list_s3_directories(params):
    base_path = params["basePath"]
    s3_path = urlparse(base_path, allow_fragments=False)
    response = {"paths": []}
    if "useImportedIfPresent" in params and params["useImportedIfPresent"]:
        # Use imported dataset if it exists
        try:
            resp = list_s3_directories({"basePath": base_path.replace(s3_path.netloc, data_bucket + "/imported")})
            if len(resp["paths"]) > 0:
                return resp
        except Exception:
            print("WARN: Exception listing imported path. Skipping it")

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
        for i in list(split(list(range(1, session_count + 1)), int(session_count / 4))):
            response["userSessions"].append({"secretId": secret, "sessionIds": i})
    return response


def get_s3_bucket_region(params):
    path = params["path"]
    http = urllib3.PoolManager()
    s3_path = urlparse(path, allow_fragments=False)
    bucket = s3_path.netloc
    response = http.request('HEAD', "https://" + bucket + ".s3.amazonaws.com")
    return {"region": response.headers["x-amz-bucket-region"], "bucket": bucket, "path": path}


def lambda_handler(event, context):
    if event["method"] == "listS3Paths":
        return list_s3_paths(event["parameters"])

    if event["method"] == "getUserSessionAsMapItems":
        return get_user_session_as_map_items(event["parameters"])

    if event["method"] == "listS3Directories":
        return list_s3_directories(event["parameters"])

    if event["method"] == "getS3BucketRegion":
        return get_s3_bucket_region(event["parameters"])


def split(a, n):
    if n == 0:
        n = 1
    n = min(n, len(a))
    k, m = divmod(len(a), n)
    return (a[i * k + min(i, m):(i + 1) * k + min(i + 1, m)] for i in range(n))
