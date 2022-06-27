# JDBC Query runner

## Input

```json
{
  "secretId": "arn:aws:secretsmanager:eu-west-1:123456789012:secret:AdminUserSecret-f25NzhFuBKvY-UIdGbD",
  "scriptPath": "s3://benchmarkingstack-databuckete3889a50/data/sql/1.sql",
  "stackName": "redshift-r1",
  "sessionId": "DDL"
}
```

## Environment variables

None

## Process

1. Fetches Secretsmanager secret based on `SecretId`
2. Creates JDBC connection to the platform (Optionally caches it)
3. Runs the script downloaded from S3 path on the platform
4. Records query execution time metrics, publishes to cloudwatch/quicksight & returns it.

## Output

```json
{
  "secretId": "arn:aws:secretsmanager:eu-west-1:123456789012:secret:AdminUserSecret-f25NzhFuBKvY-UIdGbD",
  "scriptPath": "s3://benchmarkingstack-databuckete3889a50/data/sql/1.sql",
  "stackName": "redshift-r1",
  "sessionId": "DDL",
  "metrics": {
    "runTimeMillis": 3244,
    "hasResults": 1,
    "rowDeleted": 0,
    "rowInserted": 0,
    "rowUpdated": 0
  }
}
```