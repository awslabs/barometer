import json
import os

import boto3

cf = boto3.client("cloudformation")
dynamodb = boto3.client("dynamodb")
sfn = boto3.client("stepfunctions")


def lambda_handler(event, context):
    if "Records" in event:
        handle_sns_event(event)
    else:
        manage_stack(event)


def manage_stack(event):
    print("Received platform create/destroy request \n" + json.dumps(event))
    platform_config = event["platformConfig"]
    destroy = event["destroy"]
    token = event["token"]
    stack_name = platform_config["platformType"] + "-" + platform_config["name"]
    dynamodb.put_item(TableName=os.environ["DataTableName"],
                      Item={"PK": {"S": stack_name + "#" + "taskToken"}, "value": {"S": token}})
    print("Saved task token: " + token + " to dynamodb table for stack: " + stack_name)
    if destroy:
        cf.delete_stack(StackName=stack_name)
        print("Destroying stack: " + stack_name + " task token: " + token)
    else:
        create_stack(platform_config, stack_name, token)


def create_stack(platform_config, stack_name, token):
    parameters = []
    try:
        response = cf.describe_stacks(StackName=stack_name)
        print("Stack " + stack_name + " already exists. Skipping creation.")
        sfn_respond(stack_name, response)
    except cf.exceptions.AlreadyExistsException:
        for key, value in platform_config["settings"].items():
            if type(value) == dict:
                for k, v in value.items():
                    # Nested L1 dictionary maps as camel case
                    parameters.append({"ParameterKey": key + k.capitalize(), "ParameterValue": str(v).lower()})
            else:
                parameters.append({"ParameterKey": key, "ParameterValue": str(value)})
        template_url = "https://" + os.environ["DataBucketName"] + ".s3." + os.environ[
            "AWS_REGION"] + ".amazonaws.com/platforms/" + platform_config["platformType"] + "/template.json"
        print("Executing template from: " + template_url)
        print("Saving task token " + token + " to DynamoDB & creating stack: " + stack_name)
        cf.create_stack(StackName=stack_name,
                        TemplateURL=template_url,
                        Parameters=parameters,
                        Capabilities=['CAPABILITY_IAM'],
                        NotificationARNs=[os.environ["StackUpdateTopicArn"]],
                        Tags=[{"Key": "ManagedBy", "Value": "BenchmarkingStack"}])


def handle_stack_delete_complete(record):
    stack_name = extract_stack_name(record)
    token = fetch_and_delete_task_token(stack_name)
    if token is not None:
        sfn.send_task_success(taskToken=token, output=json.dumps({}))
    else:
        print("No task token found in DynamoDB for stack: " + stack_name)


def handle_sns_event(event):
    for record in event["Records"]:
        if "ResourceType='AWS::CloudFormation::Stack'" in record["Sns"]["Message"]:
            if "ResourceStatus='CREATE_COMPLETE'" in record["Sns"]["Message"]:
                handle_stack_create_complete(record)
            elif "ResourceStatus='DELETE_COMPLETE'" in record["Sns"]["Message"]:
                handle_stack_delete_complete(record)
            print("Stack creation or deletion complete\n" + json.dumps(event))


def extract_stack_name(record):
    message_lines = record["Sns"]["Message"].split("\n")
    for line in message_lines:
        if line.startswith("StackName"):
            stack_name = line.split("=")[1].replace("'", "")
            print("Stack name extracted as: " + stack_name)
            return stack_name


def fetch_and_delete_task_token(stack_name):
    token = None
    token_response = dynamodb.delete_item(TableName=os.environ["DataTableName"],
                                          Key={"PK": {"S": stack_name + "#" + "taskToken"}},
                                          ReturnValues="ALL_OLD")
    print("Received dynamodb response: " + json.dumps(token_response))
    if "Attributes" in token_response:
        token = token_response["Attributes"]["value"]["S"]
        print("Retrieved associated task token: " + token)
    return token


def handle_stack_create_complete(record):
    stack_name = extract_stack_name(record)
    sfn_respond(stack_name)


def sfn_respond(stack_name, describe_stack_response=None):
    secret_ids = {"secretIds": [], "stackName": stack_name}
    token = fetch_and_delete_task_token(stack_name)
    if token is not None:
        stack_response = describe_stack_response
        if stack_response is None:
            stack_response = cf.describe_stacks(StackName=stack_name)
        outputs = stack_response["Stacks"][0]["Outputs"]
        for output in outputs:
            if output["OutputKey"].startswith("SecretId"):
                secret_ids["secretIds"].append(output["OutputValue"])
        print("Sending task success to Step function with payload: " + json.dumps(secret_ids))
        sfn.send_task_success(taskToken=token, output=json.dumps(secret_ids))
    else:
        print("No task token found in DynamoDB for stack: " + stack_name)
