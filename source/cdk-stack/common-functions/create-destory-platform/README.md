# Create or Destroy platform Lambda function

## Stepfunction Input

```json
{
  "platformConfig": {
    "id": "99302628-07e9-436a-aade-f8955e4d70b6",
    "configType": "platforms",
    "platformType": "redshift",
    "workloadType": [
      "olap"
    ],
    "name": "r1",
    "settings": {
      "numberOfNodes": 1,
      "features": {
        "workloadManager": true,
        "aqua": false
      },
      "nodeType": "dc2.large"
    }
  },
  "destroy": false,
  "token": "123"
}
```

## SNS Input

```json
{
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:eu-west-1:215004874051:BenchmarkingStack-StackUpdateD4D06B42-1MEOUCBM59PEU:6a876588-32f3-4caa-a934-e99aa5a43d82",
      "Sns": {
        "Type": "Notification",
        "MessageId": "2561c293-f40e-5f9e-8070-9b3244c97b05",
        "TopicArn": "arn:aws:sns:eu-west-1:215004874051:BenchmarkingStack-StackUpdateD4D06B42-1MEOUCBM59PEU",
        "Subject": "AWS CloudFormation Notification",
        "Message": "StackId='arn:aws:cloudformation:eu-west-1:215004874051:stack/redshift-r2/b26b5fb0-067e-11ec-a16b-024d61df1881'\nTimestamp='2021-08-26T15:08:55.159Z'\nEventId='87ddb530-067f-11ec-a53d-0acc532cbdcd'\nLogicalResourceId='redshift-r2'\nNamespace='215004874051'\nPhysicalResourceId='arn:aws:cloudformation:eu-west-1:215004874051:stack/redshift-r2/b26b5fb0-067e-11ec-a16b-024d61df1881'\nPrincipalId='AROATED2KAVBSKYSYPNVX:BenchmarkingStack-CommonFunctionscreateDestroyPlat-AW52QYvnui7S'\nResourceProperties='null'\nResourceStatus='DELETE_COMPLETE'\nResourceStatusReason=''\nResourceType='AWS::CloudFormation::Stack'\nStackName='redshift-r2'\nClientRequestToken='Console-DeleteStack-67a344a9-0134-d672-74bb-de4975d5051d'\n",
        "Timestamp": "2021-08-26T15:08:55.198Z",
        "SignatureVersion": "1",
        "Signature": "KeVdbQ8zc+7SMxN0DZZXuhvyUQYMaF9CB0rQL5E3dSFpN2CybOh2hY+L+CeDwy9ixoXvQk1Uv0vyvbgg0QYCiqGjii7ANxDdSQsTxV+s+0L3atHh8silnFn5AYkRB1jplflm66i/lJoV5Y3OZ+rdXzSgbBZjvLSPoK1QuWnTocw9BeZetAJgzj7cytSlTcBfnK0Mla9+ias2YF0YlGYp0cGB89rg7jCMd6cXwe4fgmgCC0YvtPK09tc2blGVtPKB4tuHa7fi3Yf3TWzlLJBlP7kYVfCKhNAfSa8vQL//D+Ss6/N8BSK0COwA+yDVTFa1JK0SCpHK8/mYchyIgzSZ7g==",
        "SigningCertUrl": "https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-010a507c1833636cd94bdb98bd93083a.pem",
        "UnsubscribeUrl": "https://sns.eu-west-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-1:215004874051:BenchmarkingStack-StackUpdateD4D06B42-1MEOUCBM59PEU:6a876588-32f3-4caa-a934-e99aa5a43d82",
        "MessageAttributes": {}
      }
    }
  ]
}
```

## Environment variables

- `DataBucketName`: benchmarking tool common s3 bucket where all cloudformation templates are stored for platforms.
- `DataTableName`: benchmarking tool common DynamoDB table to store step function task tokens
- `StackUpdateTopicArn`: Arn of the SNS topic to receive stack update events

## Process

1. if `destroy=true` destroy platform stack async.
2. else read `platformConfig.name` & fetches cloudformation template located
   at `${DataBucket}/platofmrs/${platformConfig.name}/template.json`
3. Runs `template.json` with `platformConfig.settings` which is equals to cloudformation template parameters
4. Waits for cloudformation run to finish, fetches cloudformation output variables. Format `SecretIdXXX`
   & `LogicalId = SecretIdAdminUser` for exactly one user secret.
5. Returns `secretId` for all users, keeping admin one as first one in order

## Output

None. Receives stack CREATE_COMPLETE or DELETE_COMPLETE event from Cloudformation. Calls back step function using task
token.

```json
{}
```