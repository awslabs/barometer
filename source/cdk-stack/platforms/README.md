# Platforms

Platform is an infrastructure on which data is copied & benchmarking queries gets evaluated. [Benchmarking stack](..)
registers all the [Platforms](.) automatically defined under this folder.

## How to define new platform?

Platform definition follows convention over configuration architecture pattern. All platform must follow below directory
structure under [this](.) folder.

```
.
+-- example_platform/
|   +-- icon.png  (Optional)
|   +-- config.json
|   +-- template.json
|   +-- policy.json
|   +-- driver/
|       +-- my-platform-jdbc-driver.jar
|   +-- functions/      (Optional)
|       +-- my-data-copy-function/
|           +-- .. source code files ..
```

- `example_platform`: This is the root directory of the platform definition & can have any name. Benchmarking stack
  reads all sub-directories within current platform directory
- `example_platform/icon.png`: Platform icon in PNG format. This is used for [benchmarking ui wizard](../../ui-wizard)
  platforms listing. [Default](./default.png) if not provided.
- `example_platform/config.json`: Platform configuration has the following attributes. This is used to present platform
  name on [CLI](../../cli-wizard) & [benchmarking ui wizard](../../ui-wizard).

```json
{
  "name": "Platform Name",
  "description": "My Platform does this & that"
}
```

- `example_platform/policy.json`: Contains IAM policy granting required permissions to execute
  cloudformation `template.json`
- `example_platform/template.json`: Platform deployment cloudformation template in `json`
  format. [CLI](../../cli-wizard) & [benchmarking ui wizard](../../ui-wizard) uses `Parameters` section of
  cloudformation template to display choices to the user while defining new platform for the experiment. cloudformation
  template must produce below `Outputs`.

| LogicalId           | Example Value                                                     | Notes                                                                                                                                                                            |
|---------------------|-------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SecretIdAdminUser   | `dataengineer`                                                    | Should export secretId name of secret having user `dataengineer` credentials stored in secretsmanager                                                                            |
| SecretId`Any`       | `bi-user`                                                         | Should export secretId name of secret having user  `bi-user`  credentials stored in secretsmanager                                                                               |
| DataCopierLambdaArn | `arn:aws:lambda:region:account-id:function:my-data-copy-function` | Optional - data copy function ARN if data loading is supported by the platform                                                                                                   |
| ImportData          | `ALWAYS`, `SAME_REGION`, `DIFFERENT_REGION`                       | Optional - Data is imported to [Benchmarking::DataBucketName](../README.md#exported-params) either always, either when workload data bucket region is same as current or when not|

### Requirements

1. Secrets manager secret should be stored as json string in regular json string format encrypted
   using [Benchmarking::KMSKey](../README.md#exported-params) `Imported Parameter` passed while
   executing `template.json`. (*Note:* [Benchmarking stack](..) will grant `secretsmanager:GetSecretValue` permission to
   the [lambda function executing benchmarking queries](../common-functions/jdbc-query-runner) for all exported secrets.
   All DDL scripts will be executed using user with `LogicalId = AdminUser`)

2. Platform `template.json` must allow incoming network traffic on platform port
   from [Benchmarking::Exec::SecurityGroup](../README.md#exported-params) `Imported Parameter`

```json
{
  "username": "dataengineer",
  "password": "**********",
  "engine": "redshift",
  "host": "database-1.czltk5sb7d3m.eu-west-1.rds.amazonaws.com",
  "port": 3306,
  "dbname": "dev",
  "dbInstanceIdentifier": "database-1"
}
```

[Benchmarking stack](..) will pass all the parameters defined in `template.json` by accepting them from the user.

- `example_platform/driver/my-platform-jdbc-driver.jar`: Platform must support `jdbc` connection & place driver
  in `.jar` format to the `driver/` folder
- `example_platform/functions/function-1`: Platform functions source code will be zipped & copied automatically
  to `s3://${Benchmarking::DataBucket}/platforms/example_platform/functions/function-1/code.zip` 