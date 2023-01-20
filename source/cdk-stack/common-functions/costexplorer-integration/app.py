import json
import boto3
import os
from datetime import date, timedelta

clientce = boto3.client('ce')
clients3 = boto3.client('s3') 
clientcf = boto3.client('cloudformation')

def getservicetype(service):
    
    ManagementGovernance=['AWS CloudTrail','AWS Config','AmazonCloudWatch','CloudWatch Events']
    DeveloperTools=['AWS CloudTrail','AWS CodeCommit','AWS CodePipeline','AWS Data Pipeline','AWS Glue','AWS CodeArtifact']
    Analytics=['AWS CloudTrail','AWS Config','Amazon CloudSearch','Amazon Kinesis','Amazon OpenSearch Service','Amazon Kinesis Analytics','Amazon QuickSight','Amazon Redshift']
    InternetofThings=['AWS IoT','AWS IoT SiteWise']
    SecurityIdentityCompliance=['AWS WAF','AWS Key Management Service','AWS Secrets Manager','Amazon GuardDuty']
    Compute=['AWS Lambda','Amazon EC2 Container Registry (ECR)','EC2 - Other','Amazon Elastic Compute Cloud - Compute','Amazon Lightsail']
    Database=['Amazon DynamoDB','Amazon Neptune','Amazon Relational Database Service','Amazon Timestream']
    NetworkingContentDelivery=['Amazon Elastic Load Balancing','Amazon Virtual Private Cloud','Amazon CloudFront','Amazon API Gateway']
    BusinessApplications=['Amazon Pinpoint']
    MachineLearning=['Amazon SageMaker']
    ApplicationIntegration=['AWS Step Functions','Amazon Simple Notification Service','Amazon Simple Queue Service']
    Storage=['Amazon Simple Storage Service']
    
    servicetype='unknown'
    
    if service in ManagementGovernance:
        servicetype='Management & Governance'
    if service in DeveloperTools:
        servicetype='Developer Tools'                
    if service in Analytics:
        servicetype='Analytics'
    if service in InternetofThings:
        servicetype='Internet of Things'                
    if service in SecurityIdentityCompliance:
        servicetype='Security, Identity & Compliance'    
    if service in Compute:
        servicetype='Compute'                
    if service in Database:
        servicetype='Database'     
    if service in NetworkingContentDelivery:
        servicetype='Networking, Content & Delivery'                
    if service in BusinessApplications:
        servicetype='Business Applications'     
    if service in MachineLearning:
        servicetype='Machine Learning'                
    if service in ApplicationIntegration:
        servicetype='Application Integration'
    if service in Storage:
        servicetype='Storage' 
        
    if servicetype=='unknown':
        print('no service type match for : ' + service)
        
    return servicetype

def lambda_handler(event, context):  
    
    #response = clientdynamodb.scan(TableName='BenchmarkingStack-DataTable')
    #print(response) 
    
    responseliststacks = clientcf.list_stacks( StackStatusFilter=[ 'CREATE_COMPLETE','DELETE_COMPLETE'])
    #print(responseliststacks)
    listplatformstackname = []
    if 'StackSummaries' in responseliststacks:     
        results = responseliststacks["StackSummaries"]
        while "NextToken" in responseliststacks:
            responseliststacks = clientcf.list_stacks( StackStatusFilter=[ 'CREATE_COMPLETE','DELETE_COMPLETE'],NextToken=responseliststacks["NextToken"])
            results.extend(responseliststacks["StackSummaries"])
 
        for stacksummaries in results:
            responsedescribestacks = clientcf.describe_stacks(StackName=stacksummaries['StackId'])
            for stackdescription in responsedescribestacks['Stacks']:
                for stacktag in stackdescription['Tags']:
                    if stacktag['Value'] == 'BenchmarkingStack':
                        listplatformstackname.append(stacksummaries['StackName']) 
        
        s3rootfolder='costexplorer/'
        payloadcostusagedaily=''   
        today = date.today() 
        todayminus30 = date.today() - timedelta(days=90)   
        todayplus30 = date.today() + timedelta(days=30)   
        lastmonthend = today.replace(day = 1) - timedelta(days=1)
        last3monthsbegin = (today.replace(day = 1) - timedelta(days=90)).replace(day = 1)
        
        for platformstackname in listplatformstackname : 
            #COST USAGE DAILY 
            response = clientce.get_cost_and_usage(
                    TimePeriod={
                        'Start': todayminus30.strftime("%Y-%m-%d"),
                        'End': today.strftime("%Y-%m-%d")
                    },
                    Granularity='DAILY',
                    Filter={
                        'Tags': {
                            'Key': 'PlatformStackName',
                            'Values': [platformstackname],
                            'MatchOptions': [ 'EQUALS'  ]
                        }
                    },
                    Metrics=['AmortizedCost' , 'BlendedCost'],
                    GroupBy=[
                        {
                            'Type': 'DIMENSION',
                            'Key': 'SERVICE'
                        },
                    ], 
                ) 
            #print(response['ResultsByTime'])
            for resultsbytime in response['ResultsByTime']: 
                start=resultsbytime['TimePeriod']['Start'] 
                end=resultsbytime['TimePeriod']['End'] 
                for group in resultsbytime['Groups']: 
                    servicetype = getservicetype(group['Keys'][0])    
                    payloadcostusagedaily=json.dumps({'Stack_Name':platformstackname,'Time_Period_Start':start,'Time_Period_End':end,
                    'Service_Type':servicetype,'Service_Name':group['Keys'][0],'Amortized_Cost_USD':float(group['Metrics']['AmortizedCost']['Amount']),
                    'Blended_Cost_USD':float(group['Metrics']['BlendedCost']['Amount'])}) + '\n' + payloadcostusagedaily 
        
        #print(payloadcostusagedaily)       
        rsp = clients3.put_object(Body=bytearray(payloadcostusagedaily, "utf8"), Bucket=os.environ['DataBucketName'],  Key=s3rootfolder  + 'benchmarkingstackdailycosts')