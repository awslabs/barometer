import boto3


def lambda_handler(event, context):
    return {
             "secretIds": [
               "secretId.user1",
               "secretId.user2"
             ]
           }
