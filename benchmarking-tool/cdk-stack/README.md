# Benchmarking Stack

This project deploys [Benchmarking Stack](./lib/benchmarking-stack.ts) infrastructure to the user account.

## Deploys components

1. Encryption key (KMS) for encrypting/decrypting any data at rest.
2. S3 bucket to copy [workload](./workloads) dataset & [platform](./platforms) cloudformation template
3. Commonly reused [lambda functions](./common-functions) for benchmarking activities
4. Step function workflow to orchestrate experiment execution.
5. Optional - Amplify UI tool

## Benchmarking flow

1. User deploys [Benchmarking Stack](./lib/benchmarking-stack.ts) to create above components
2. Prepares experiment configuration using [CLI](../../cli-wizard) & [benchmarking ui wizard](../../ui-wizard).
3. User runs experiment via CLI or UI which internally starts `experiment runner` step function execution defined in
   step 4 of above infrastructure by passing parameter defined below

```json
{
  "concurrentSessionCount": 1,
  "executionMode": "concurrent",
  "keepInfrastructure": false,
  "platformConfig": {
    "name": "redshift",
    "settings": {
      "numberOfNodes": "2",
      "features": {
        "workloadManager": true,
        "concurrencyScaling": true
      },
      "nodeType": "ra3.4xlarge"
    }
  },
  "workloadConfig": {
    "name": "tpc-h/v3",
    "settings": {
      "volume": {
        "name": "3 TB",
        "path": "s3://datalab-bucket/tpc/tpc-h/v3/3t/pipe-separated/"
      },
      "ddl": {
        "path": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/"
      },
      "queries": {
        "path": "s3://benchmarking-tool-shared/tpc/tpc-h/benchmarking-queries/"
      },
      "supportedPlatforms": [
        "Redshift",
        "Redshift Spectrum",
        "Athena"
      ],
      "usePartitioning": true,
      "loadMethod": "copy"
    }
  }
}
```

4. Step function flow `experiment runner`
    1. Invokes [create-destory-platform](./common-functions/create-destory-platform) lambda (if it doesn't exist) which
       runs cloudformation `template.json` with user provided options
    2. Invokes [jdbc-query-runner](./common-functions/jdbc-query-runner) lambda which connects to platform using JDBC
       driver & runs all DDL statements read from S3 bucket as per [workload](./workloads) config
    3. Invokes [data-copier](./common-functions/data-copier) lambda function which optionally copies workload dataset
       from external S3 bucket to benchmarking stack created S3 bucket.
    4. Invokes [data-copier](./common-functions/data-copier) lambda function which optionally
       executes [platform](./platforms) specific procedure to copy data into the platform from external or benchmarking
       stack created S3 bucket.
    5. Runs `benchmark runner` step function flow in parallel for `N` parallel users as defined in experiment config
    6. Step function flow `benchmark runner`
        1. Invokes [jdbc-query-runner](./common-functions/jdbc-query-runner) lambda which connects to platform using
           JDBC driver & runs all queries statements read from S3 bucket (sequential or parallel) as
           per [workload](./workloads) config
        2. Captures all metrics & records them to Cloudwatch/Quicksight
    7. Invokes [dashboard-builder](./common-functions/dashboard-builder) lambda which creates/updates cloudwatch
       monitoring (& quicksight?) dashboard for the given experiment
    8. Invokes [create-destory-platform](./common-functions/create-destory-platform) lambda which optionally destroys
       platform as per experiment configuration
5. User optionally destroys [Benchmarking Stack](./lib/benchmarking-stack.ts) to destroy above components (S3 bucket
   with dataset is also optionally deleted)

### [Exported Parameters](#exported-params)

Benchmarking stack exports below parameters for [platform](./platforms) cloudformation stack to import, reuse or to
grant relevant access

| Export.Name                         | Value                                          | Notes                                                                                                                                           |
|-------------------------------------|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `Benchmarking::KMSKey`              | KMS key id                                     | KMS key used by benchmarking tool. Platform can use this key to encrypt secret manager secret where platform jdbc connection details is stored. |
| `Benchmarking::Exec::SecurityGroup` | Query runner lambda function security group id | Platform can use this security group to grant inbound network access to the platform                                                            |