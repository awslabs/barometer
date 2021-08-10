# Create or Destroy platform Lambda function

## Input

```json
{
  "platformConfig": {
    "name": "redshift",
    "settings": {
      "numberOfNodes": "5",
      "features": {
        "workloadManager": true,
        "concurrencyScaling": true
      },
      "nodeType": "ra3.4xlarge"
    }
  },
  "destroy": false
}
```

## Environment variables

- `DataBucket`: benchmarking tool common s3 bucket where all cloudformation templates are stored for platforms.

## Process

1. if `destroy=true` destroy platform stack async.
2. else read `platformConfig.name` & fetches cloudformation template located
   at `${DataBucket}/platofmrs/${platformConfig.name}/template.json`
3. Runs `template.json` with `platformConfig.settings` which is equals to cloudformation template parameters
4. Waits for cloudformation run to finish, fetches cloudformation exported variables.
   Format `AWS::StackName +":"+secretId.user1` & `LogicalId = AdminUser` for exactly one user secret.
5. Returns `secretId` for all users, keeping admin one as first one in order

## Output

```json
{
  "secretIds": [
    "secretId.user1",
    "secretId.user2"
  ]
}
```