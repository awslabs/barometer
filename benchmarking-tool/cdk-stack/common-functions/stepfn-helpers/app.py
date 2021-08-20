import boto3


def lambda_handler(event, context):
    if event["method"] == "listS3Paths":
        return {
                 "paths": [
                   "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/1.sql",
                   "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/2.sql"
                 ]
               }
    if event["method"] == "getUserSessionAsMapItems":
        return {
                 "userSessions": [
                   {
                     "secretId": "secretId.user1",
                     "sessionId": "1"
                   },
                   {
                     "secretId": "secretId.user1",
                     "sessionId": "2"
                   },
                   {
                     "secretId": "secretId.user1",
                     "sessionId": "3"
                   },
                   {
                     "secretId": "secretId.user2",
                     "sessionId": "1"
                   },
                   {
                     "secretId": "secretId.user2",
                     "sessionId": "2"
                   },
                   {
                     "secretId": "secretId.user2",
                     "sessionId": "3"
                   }
                 ]
               }