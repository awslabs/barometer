# JDBC Query runner

## Input

```json
{
  "secretId": "RedshiftUser1SecretId",
  "scriptPath": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/1.sql"
}
```

## Environment variables

## Process

1. Fetches Secretsmanager secret based on `SecretId`
2. Creates JDBC connection to the platform
3. Runs the script downloaded from S3 path on the platform
4. Records query execution time metrics, publishes to cloudwatch/quicksight & returns it.

## Output

```json
{
  "secretId": "RedshiftUser1SecretId",
  "scriptPath": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/1.sql",
  "user": "dataengineer",
  "platformQueryId": "4222",
  "metrics": {
    "runTimeMillis": 3244
  }
}
```