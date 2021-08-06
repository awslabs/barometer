# Workloads

Workloads is an dataset sitting on S3. Benchmarking tool [CLI](../../cli-wizard)
& [benchmarking ui wizard](../../ui-wizard) automatically uses any workloads defined under [this](.) folder to show user
as a choice while defining experiment.

## How to define new workload?

Workload definition follows convention over configuration architecture pattern. All workload must follow below directory
structure under [this](.) folder.

```
.
+-- example_workload/
|   +-- icon.png
|   +-- config.json
```

- `example_workload`: This is the root directory of the workload definition & can have any name. Benchmarking stack
  reads all sub-directories within current workload directory
- `example_workload/icon.png`: Workload icon in PNG format. This is used for [benchmarking ui wizard](../../ui-wizard)
  platforms listing. [Default](./default.png) if not provided.
- `example_workload/config.json`: Workload configuration has the following attributes. This is used to present workload
  name & all other configurations on [CLI](../../cli-wizard) & [benchmarking ui wizard](../../ui-wizard).

## Example config definition

```json
{
  "name": "TPC-H v3",
  "description": "TPC-H v3 dataset",
  "type": "OLAP",
  "volumes": [
    {
      "name": "100 GB",
      "path": "s3://external-bucket/tpc/tpc-h/v3/100g/pipe-separated/"
    },
    {
      "name": "3 TB",
      "path": "s3://external-bucket/tpc/tpc-h/v3/3t/pipe-separated/"
    }
  ],
  "ddl": {
    "Redshift": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/redshift/",
    "Redshift Spectrum": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/redshift/",
    "Athena": "s3://benchmarking-tool-shared/tpc/tpc-h/ddl/athena/"
  },
  "queries": {
    "Redshift": "s3://benchmarking-tool-shared/tpc/tpc-h/benchmarking-queries/redshift/",
    "Redshift Spectrum": "s3://benchmarking-tool-shared/tpc/tpc-h/benchmarking-queries/redshift/",
    "Athena": "s3://benchmarking-tool-shared/tpc/tpc-h/benchmarking-queries/athena/"
  },
  "supportedPlatforms": [
    "Redshift",
    "Redshift Spectrum",
    "Athena"
  ]
}
```

- `name`: Defines name of the workload
- `description`: Defines description of the workload
- `type`: Used to auto select option form Analytical vs Transactional workloads
- `volumes`: Defines multiple sizes of the dataset
- `volume[0].name`: The name of given size of the dataset to preset user with sizing options
- `volume[0].path`: The path from where benchmarking tool can read/download dataset when needed
- `ddl`: The path to the platform specific ddl statements to be used for creating schema in target platform.
  Benchmarking tool sorts all `.sql` files in ascending order of name & executes them one by one on target platform. if
  sequence matters make sure to name accordingly.

```
Example structure for DDL execution ordering
.
+-- ddl/redshift
|   +-- 1_execute_first.sql
|   +-- 2_execute_after.sql 
```

- `queries`: The path to the platform specific benchmarking queries. Execution order is not guaranteed by benchmarking
  tool as it purely depends on user choices while configuring experiment.
- `supportedPlatforms`: List of all supported platform benchmarking tool ensures experiment uses given workload only on
  supported platforms. Supported platform names must match with [platform](../platforms) names defined in
  platform `config.json`