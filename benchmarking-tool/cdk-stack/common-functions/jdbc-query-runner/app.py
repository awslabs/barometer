import boto3


def lambda_handler(event, context):
    return {
             "secretId": "RedshiftUser1SecretId",
             "scriptPath": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/1.sql",
             "user": "dataengineer",
             "platformQueryId": "4222",
             "metrics": {
               "runTimeMillis": 3244
             }
           }
