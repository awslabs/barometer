# Platform lambda proxy function

## Step function input

```json
{
  "stackName": "redshift-r1",
  "lambdaFunction": "proxy-function-name",
  "proxyPayload": {
    "secretId": "arn:aws:secretsmanager:eu-west-1:123456789012:secret:AdminUserSecret-iZMg09kU12As-R8I6Al",
    "dataset": "s3://benchmarkingstack-databuckete3889a50/datasets/tpc-data/tpc-ds-v3/1gb-scale-factor/parquet/",
    "sessionId": "TEST"
  },
  "token": "123"
}
```

## Platform proxy function input in case of error

```json
{
  "status": "FAILURE",
  "stackName": "redshift-r1",
  "proxyToken": "proxy-function-token",
  "error": "My Error",
  "cause": {
    "Anything": "Anything"
  },
  "lambdaFunction": "proxy-function-name"
}
```

## Platform proxy function input in case of success

```json
{
  "status": "SUCCESS",
  "stackName": "redshift-r1",
  "proxyToken": "proxy-function-token",
  "lambdaFunction": "proxy-function-name"
}
```

## Environment variables

- `DataBucketName`: Benchmarking tool common data bucket
- `DataTableName`: Benchmarking tool DynamoDB table to store task tokens

## Process

1. Saves task token to the DynamoDB table
2. Calls proxy lambda function with proxyPayload in `Event` mode. Waits for proxy function to call back for success or
   failure.
3. proxied function calls back with success or failure message
4. Retrives task token back & notifies step function with same output as proxied function

## Output

None

```json
{}
```