# AWS Barometer

> A tool to automate analytic platform evaluations

AWS Barometer helps customers to get data points needed for service selection/service configurations for given workload.
Benchmarking tool is created by [AWS Prototyping team (EMEA)](https://w.amazon.com/bin/view/AWS_EMEA_Prototyping_Labs)
based
on [this narrative](https://amazon.awsapps.com/workdocs/index.html#/document/760aa6dceb39082084f710abccf4d973b4156f1ec912acb2270c918656025731)
.

## 📋 Table of content

- [Description](#-description)
- [Use cases](#-use-cases)
- [Pre-requisites](#-pre-requisites)
- [Installing](#-installing)
- [Deployment](#-deployment)
- [Quickstart](#-quickstart)
- [Architecture](#-architecture)
- [Cleanup](#-cleanup)
- [See Also](#-see-also)

## 🔰 Description

AWS Barometer will deploy [cdk](https://aws.amazon.com/cdk/) stack which is used to run benchmarking experiments. The
experiment is a combination of [platform](./source/cdk-stack/platforms) and [workload](./source/cdk-stack/workloads) which can be
defined using [cli-wizard](./source/cli-wizard) provided by AWS Barometer tool. Example running experiment in QuickStart.

## 🛠 Use cases

- Comparison of service performance: Redshift vs Redshift Spectrum
- Comparison of configurations: Redshift dc2 vs ra3 node type
- Performance impact of feature: Redshift AQUA vs Redshift WLM
- Right tool for the job selection: Athena vs Redshift for given workload
- [Registering your custom platform](./source/cdk-stack/platforms): Redshift vs My Own Database
- [Registering your custom workload](./source/cdk-stack/workloads): My own dataset vs Redshift

AWS Barometer supports below combinations as experiment

- Supported platforms:
    - [Redshift](./source/cdk-stack/platforms/redshift)
- Supported workloads:
    - [TPC-DS/v3](./source/cdk-stack/workloads/tpc-ds) (Volumes: 1 GB)

## 🎒 Pre-requisites

- [mvn](https://maven.apache.org/install.html) with JDK 8 or higher available in current environment
- [npm](https://nodejs.org/en/download/)
- AWS cdk cli: `npm install -g aws-cdk`
- [Aws cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) configured for target AWS_ACCOUNT &
  AWS_REGION for deploying the tool
- [jq](https://stedolan.github.io/jq/download/) tool installed & available in current environment

## 🚀 Installing

1. Clone the repository https://gitlab.aws.dev/aws-emea-prototyping/data-analytics/reusable-assets/aws-barometer
2. Go to the folder deployment `cd deployment`

## 🎮 Deployment

Set below environment variables if not set already in bash/cli session

```bash
# For Linux or MacOS
# Example:
# export CDK_DEPLOY_ACCOUNT=123456789
# export CDK_DEPLOY_REGION=eu-west-1
export CDK_DEPLOY_ACCOUNT=Aws account id to deploy the tool
export CDK_DEPLOY_REGION=Aws region to deploy the tool

# For Windows
SET CDK_DEPLOY_ACCOUNT=Aws account id to deploy the tool
SET CDK_DEPLOY_REGION=Aws region to deploy the tool
```

With aws cdk cli installed, run deploy

```shell
./deploy.sh # For Linux or MacOS use deploy.sh, For Windows use deploy.bat
```

Once `BenchmarkingStack` is deployed successfully run cli-wizard to run experiments.

```shell
# Set CDK_DEPLOY_ACCOUNT, CDK_DEPLOY_REGION again if using different terminal window
cd cli-wizard
npm run wizard
```

## 🎬 Quickstart

![](./assets/define_experiment.gif)

## Architecture

### User flow

![](./assets/Benchmarking-tool-architacture-Highlevel.jpg)

1. User deploys AWS Barometer Benchmarking Stack
2. AWS Barometer Benchmarking stack creates infrastructure & step function workflows
3. User uses [cli-wizard](./source/cli-wizard) to define & run experiments which triggers experiment runner workflow internally
4. Workflow deploys, benchmarks & destroys platform (additional cloudformation stack to deploy service, e.g. Redshift Cluster)
5. Workflow creates persistent dashboard registering metrics
6. User uses this dashboard to compare benchmarking results

### Detailed architecture for Redshift platform

![](./assets/Benchmarking-tool-architacture-Detailed%20with%20Redshift.jpg)

## Cleanup

1. To clean up any platform, delete stack with name starting with platform name. Example: `redshift-xyz`
2. Go to Cloudformation service and select stack named `BenchmarkingStack` (or run `cdk destroy` from [cdk-stack](./source/cdk-stack) folder)

## 👀 See Also

- [Architectural & design concepts](./Concepts.md) driving this project
- [Benchmarking Stack](./source/cdk-stack) infrastructure
- [Cli Wizard](./source/cli-wizard)
- How to [add new platform support](./source/cdk-stack/platforms)
- How to [add new workload support](./source/cdk-stack/workloads)
