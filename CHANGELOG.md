# v2.0.0

- MVP2 version of Barometer.
    - Single dependency to run Barometer (Docker)
    - Bring your own workload (schema, data as parquet and benchmarking queries)
    - Redshift Serverless via “Run benchmark only” option

    - Redshift data copy lambda function now uses Data API so no more time limits on copying data form S3 to redshift
    - TPC-DS v2 is supported from redshift-downloads bucket directly for us-east-1
    - TPC-DS v2 is supported by importing data to local bucket using S3 batch operations for all other regions
    - Data import flow automatically detects local bucket and copies data only if not copied before - independent of
      experiments executed

    - Run benchmarking only option (pass connection string and query location from S3, Barometer does benchmark only and
      produces dashboards, similar to Bring your own platform)
    - Benchmarking queries run on ECS Fargate instead of Lambda so no more limit of 15 minutes
    - Barometer allocates ECS Fargate tasks dynamically depending on user sessions (ex: 1 container for 4 users, 20 for
      75 users) and uses Java threading for concurrent user sessions within container (allows single container to handle
      multiple user sessions)

# v1.0.0

- MVP1 version of Barometer. Supports comparison of Redshift vs Redshift for different configuration/node types.
- Supported Platforms
    - Redshift
- Supported Workloads
    - TPC-DS