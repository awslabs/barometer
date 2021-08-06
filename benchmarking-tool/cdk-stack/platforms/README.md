# Platforms

Platform is an infrastructure on which data is copied & benchmarking queries gets evaluated. [Benchmarking stack](..)
registers all the [Platforms](.) automatically defined under this folder.

## How to define new platform?

Platform definition follows convention over configuration architecture pattern. All platform must follow below directory
structure under [this](.) folder.

```
.
+-- example_platform/
|   +-- icon.png
|   +-- config.json
|   +-- template.json
|   +-- driver/
|       +-- my-platform-jdbc-driver.jar
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

- `example_platform/template.json`: Platform deployment cloudformation template in `json`
  format. [CLI](../../cli-wizard) & [benchmarking ui wizard](../../ui-wizard) uses `Parameters` section of
  cloudformation template to display choices to the user while defining new platform for the experiment. cloudformation
  template must `Export` below `Outputs`.

| Value          | Export.Name                        | LogicalId | Description | Example Export.Name            | Notes                                                                                                 |
|----------------|------------------------------------|-----------|-------------|--------------------------------|-------------------------------------------------------------------------------------------------------|
| secretId.user1 | AWS::StackName +":"+secretId.user1 | Any       | Any         | my-stack:secretId.dataengineer | Should export secretId name of secret having user `dataengineer` credentials stored in secretsmanager |
| secretId.user2 | AWS::StackName +":"+secretId.user2 | Any       | Any         | my-stack:secretId.bi-user      | Should export secretId name of secret having user  `bi-user`  credentials stored in secretsmanager    |

Requirements

1. Secrets manager secret should be stored as json string in regular json string format encrypted
   using [Benchmarking::KMSKey](../README.md#exported-params) `Imported Parameter` passed while
   executing `template.json`. (*
   Note:* [Benchmarking stack](..) will grant `secretsmanager:GetSecretValue` permission to
   the [lambda function executing benchmarking queries](../common-functions/jdbc-query-runner) for all exported secrets)

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