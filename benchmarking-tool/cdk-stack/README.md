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
  "platformConfig": {
    "id": "674864f3-16fd-4d6b-8b0f-6a3dcd0b6d28",
    "configType": "platforms",
    "platformType": "redshift",
    "name": "r1",
    "settings": {
      "numberOfNodes": "1",
      "features": {
        "workloadManager": true
      },
      "nodeType": "dc2.large"
    }
  },
  "workloadConfig": {
    "id": "f6d49ad5-9728-4ee2-a7bc-19db51d9bde9",
    "configType": "workloads",
    "name": "w1",
    "settings": {
      "name": "TPC-DS/v3",
      "description": "TPC-DS v3",
      "volume": {
        "name": "1 GB",
        "path": "s3://aws-prototype-solution-data-benchmark/datasets/tpc-data/tpc-ds-v3/1gb/",
        "format": "csv",
        "compression": "gzip",
        "delimiter": "|"
      },
      "ddl": {
        "path": "s3://aws-prototype-solution-data-benchmark/datasets/tpc-data/tpc-ds-v3/ddl/redshift/"
      },
      "queries": {
        "path": "s3://aws-prototype-solution-data-benchmark/datasets/tpc-data/tpc-ds-v3/benchmarking-queries/"
      },
      "supportedPlatforms": [
        "redshift",
        "redshift-spectrum"
      ],
      "loadMethod": "direct",
      "workloadType": "OLAP"
    }
  },
  "concurrentSessionCount": 1,
  "executionMode": "sequential",
  "keepInfrastructure": true
}
```

4. Step function flow `experiment runner`
    1. Invokes [create-destory-platform](./common-functions/create-destory-platform) lambda (if it doesn't exist) which
       runs cloudformation `template.json` with user provided options in scope of `policy.json`
    2. Invokes [jdbc-query-runner](./common-functions/jdbc-query-runner) lambda which connects to platform using JDBC
       driver & runs all DDL statements read from S3 bucket as per [workload](./workloads) config
    3. Invokes [stepfn-helper](./common-functions/stepfn-helpers) lambda function which optionally copies workload
       dataset from external S3 bucket to benchmarking stack created S3 bucket.
    4. Invokes [platform-lambda-proxy](./common-functions/platform-lambda-proxy) lambda function which optionally
       executes [platform](./platforms) specific [functions](./platforms/redshift/functions) to copy data into the
       platform from external or benchmarking stack created S3 bucket.
    5. Runs `benchmark runner` step function flow in parallel for `N` parallel users as defined in experiment config
    6. Step function flow `benchmark runner`
        1. Invokes [jdbc-query-runner](./common-functions/jdbc-query-runner) lambda which connects to platform using
           JDBC driver & runs all queries statements read from S3 bucket (sequential or parallel) as
           per [workload](./workloads) config
        2. Captures all metrics & records them to Cloudwatch
    7. Invokes [dashboard-builder](./common-functions/dashboard-builder) lambda which creates/updates cloudwatch
       monitoring dashboard for the given experiment
    8. Invokes [create-destory-platform](./common-functions/create-destory-platform) lambda which optionally destroys
       platform as per experiment configuration
5. User optionally destroys [Benchmarking Stack](./lib/benchmarking-stack.ts) to destroy above components (S3 bucket
   with dataset is also optionally deleted)

### [Exported Parameters](#exported-params)

Benchmarking stack exports below parameters for [platform](./platforms) cloudformation stack to import, reuse or to
grant relevant access

| Export.Name                            | Value                                          | Notes                                                                                                                                           |
|----------------------------------------|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `Benchmarking::DataBucketName`         | Benchmarking stack data bucket                 | Contains all platform & workload config files & folders                                                                                         |
| `Benchmarking::DataBucketArn`          | Benchmarking stack data bucket ARN             | Same as above but ARN for platform stack to use                                                                                                 |
| `Benchmarking::VpcId`                  | VPC Id of the Benchmarking VPC                 | Platform can use this VPC to deploy resources                                                                                                   |
| `Benchmarking::SubnetIds`              | Isolated Subnet Ids of the Benchmarking VPC    | Platform can use this subnets to deploy resources                                                                                               |
| `Benchmarking::KMSKey`                 | KMS key id                                     | KMS key used by benchmarking tool. Platform can use this key to encrypt secret manager secret where platform jdbc connection details is stored. |
| `Benchmarking::Exec::SecurityGroup`    | Query runner lambda function security group id | Platform can use this security group to grant inbound network access to the platform                                                            |
| `Benchmarking::Exec::QueryFunctionArn` | ARN of JDBC Query runner function              | Platform can reuse this function to run JDBC queries on platform datastore                                                                      |
| `Benchmarking::Exec::ProxyFunctionArn` | ARN of platform proxy function                 | Lambda functions exposed by platforms will be invoked using proxy function. Platform lambda function can use this ARN to notify success/failure |
| None                                   | CostExplorer                                   | Link to the cost estimates page                                                                                                                 |
| None                                   | ExperimentRunnerArn                            | ARN of experiment runner step function workflow                                                                                                 |