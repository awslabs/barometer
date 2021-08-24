import boto3
import os

cf = boto3.client("cloudformation")

def lambda_handler(event, context):
    platform_config = event["platformConfig"]
    destroy = event["destroy"]

    if destroy:
        cf.delete_stack(StackName=platform_config["platformType"]+"-"+platform_config["name"])
    else:
        parameters = []
        for key,value in platform_config["settings"].items():
            if type(value) == dict:
                for k,v in value.items():
                    # Nested L1 dictionary maps as camel case
                    parameters.append({"ParameterKey":key+k.capitalize(), "ParameterValue": str(v).lower()})
            else:
                parameters.append({"ParameterKey":key, "ParameterValue": str(value)})
        template_url = "https://"+os.environ["DataBucketName"]+".s3."+os.environ["AWS_REGION"]+".amazonaws.com/platforms/"+platform_config["platformType"]+"/template.json"
        print("Executing template from: " + template_url)
        cf.create_stack(StackName=platform_config["platformType"]+"-"+platform_config["name"], TemplateURL=template_url, Parameters=parameters, Capabilities=['CAPABILITY_IAM'], Tags=[{"Key":"CreatedBy","Value":"BenchmarkingStack"}])
    return {
             "secretIds": [
               "secretId.user1",
               "secretId.user2"
             ]
           }
