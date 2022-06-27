# Dashboard builder Lambda function

## Input

```json
{
  "stackName": "redshift-s2",
  "userSessions": [
    {
      "secretId": "arn:aws:secretsmanager:eu-west-1:123456789012:secret:AdminUserSecret-3QZzJZ0cQCVl-6JzWbk",
      "sessionId": "1"
    }
  ],
  "experimentName": "tpc-ds/v3-redshift",
  "queries": [
    "s3://benchmark-bucket/datasets/tpc-data/tpc-ds-v3/benchmarking-queries/query_1.sql",
    "s3://benchmark-bucket/datasets/tpc-data/tpc-ds-v3/benchmarking-queries/query_2.sql"
  ],
  "ddlQueries": [
    "s3://benchmark-bucket/datasets/tpc-data/tpc-ds-v3/ddl/redshift/ddl.sql"
  ]
}
```

## Environment variables

- `ExperimentDashboardPrefix`: The prefix for all experiment dashboard names
- `SummaryDashboardName`: Name of the benchmarking tool summary dashboard

## Process

1. Create new cloudwatch dashboard for experiment using naming conventions `ExperimentDashboardPrefix-workload-platform`
2. Adds runtimeInMillis metric value for all widgets for all users in experiment dashboard. SessionIds are `DDL`, `COPY`
   or user's sessionId for example `1, 2, 3 etc.`
3. Updates summary dashboard using user's sessionIds

## Output

None.

```json
{}
```