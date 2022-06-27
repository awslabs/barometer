# Workloads

Workloads is a dataset sitting on S3. Benchmarking tool [CLI](../../cli-wizard)
& [benchmarking ui wizard](../../ui-wizard) automatically uses any workloads defined under [this](.) folder to show user
as a choice while defining experiment.

## How to define new workload?

Workload definition follows convention over configuration architecture pattern. All workload must follow below directory
structure under [this](.) folder.

```
.
+-- example_workload/
|   +-- icon.png (Optional)
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
  "name": "TPC-DS/v3",
  "description": "TPC-DS v3",
  "type": "olap",
  "volumes": [
    {
      "name": "1 GB",
      "path": "s3://benchmarkingstack-databuckete3889a50/datasets/tpc-data/tpc-ds-v3/1gb/",
      "format": "csv",
      "compression": "gzip",
      "delimiter": "|"
    }
  ],
  "ddl": {
    "redshift": {
      "path": "s3://benchmarkingstack-databuckete3889a50/datasets/tpc-data/tpc-ds-v3/ddl/redshift/"
    },
    "redshift-spectrum": {
      "path": "s3://benchmarkingstack-databuckete3889a50/datasets/tpc-data/tpc-ds-v3/ddl/redshift-spectrum/"
    }
  },
  "queries": {
    "redshift": {
      "path": "s3://benchmarkingstack-databuckete3889a50/datasets/tpc-data/tpc-ds-v3/benchmarking-queries/"
    },
    "redshift-spectrum": {
      "path": "s3://benchmarkingstack-databuckete3889a50/datasets/tpc-data/tpc-ds-v3/benchmarking-queries/"
    }
  },
  "supportedPlatforms": [
    "redshift",
    "redshift-spectrum"
  ]
}
```

- `name`: Defines name of the workload
- `description`: Defines description of the workload
- `type`: Used to auto select option form Analytical vs Transactional workloads
- `volumes`: Defines multiple sizes of the dataset
- `volume[0].name`: The name of given size of the dataset to preset user with sizing options
- `volume[0].path`: The path from where benchmarking tool can read/download dataset when needed
- `volume[0].format`: Format of the workload data. Can be either `csv` or `parquet` for now.
- `volume[0].compression`: Compression of dataset. Can be `gzip`, `zip`, `lzop` etc.
- `volume[0].delimiter`: Required only if format is `csv`
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