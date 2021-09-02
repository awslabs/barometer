import json

import boto3
import os
import hashlib

dynamodb = boto3.client("dynamodb")
fn = boto3.client("lambda")
sfn = boto3.client("stepfunctions")


def lambda_handler(event, context):
    stack_name = event["stackName"]
    lambda_fn = event["lambdaFunction"].split(":")
    proxy_lambda = lambda_fn[-1]

    if "status" in event:
        token = fetch_and_delete_task_token(stack_name, proxy_lambda)
        if event["status"] == "SUCCESS":
            sfn.send_task_success(taskToken=token, output=json.dumps(event))
        else:
            sfn.send_task_failure(taskToken=token, error=event["error"], cause=event["cause"])
    else:
        save_task_token(stack_name, proxy_lambda, event["token"])
        print("Task token saved to dynamodb. Invoking " + proxy_lambda)
        payload = {"data": event["proxyPayload"], "stackName": stack_name}
        print("Payload: " + json.dumps(payload))
        response = fn.invoke(FunctionName=proxy_lambda, LogType='Tail',
                             InvocationType='Event',
                             Payload=bytes(json.dumps(payload), 'utf-8'))
        print("Proxy lambda response: " + json.dumps(response))


def save_task_token(stack_name, proxy_lambda, token):
    key = stack_name + "#" + proxy_lambda
    print("Saving token for proxy invoke: " + key)
    dynamodb.put_item(TableName=os.environ["DataTableName"],
                      Item={"PK": {"S": hashlib.md5(key.encode('utf-8')).hexdigest()}, "value": {"S": token}})


def fetch_and_delete_task_token(stack_name, proxy_lambda):
    token = None
    key = stack_name + "#" + proxy_lambda
    print("Fetching token for proxy invoke: " + key)
    token_response = dynamodb.delete_item(TableName=os.environ["DataTableName"],
                                          Key={"PK": {"S": hashlib.md5(key.encode('utf-8')).hexdigest()}},
                                          ReturnValues="ALL_OLD")
    print("Received dynamodb response: " + json.dumps(token_response))
    if "Attributes" in token_response:
        token = token_response["Attributes"]["value"]["S"]
        print("Retrieved associated task token: " + token)
    return token
