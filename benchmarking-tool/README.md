# Benchmarking Tool

> A tool to automate analytic platform evaluations

This tool helps customers to get data points needed for service selection/service configurations for given workload.
Benchmarking tool is created by [AWS Prototyping team (EMEA)](https://w.amazon.com/bin/view/AWS_EMEA_Prototyping_Labs)
based
on [this narrative](https://amazon.awsapps.com/workdocs/index.html#/document/760aa6dceb39082084f710abccf4d973b4156f1ec912acb2270c918656025731)
.

## 🔰 Description

This tool will deploy [cdk](https://aws.amazon.com/cdk/) stack which is used to run benchmarking experiments. The
experiment is a combination of [platform](./cdk-stack/platforms) and [workload](./cdk-stack/workloads) which can be
defined using [cli-wizard](./cli-wizard) provided by the tool. Example running experiment in QuickStart.

### Quickstart

![](./define_experiment.gif)

### Use cases

- Comparison of tool performance: Redshift vs Redshift Spectrum
- Comparison of configurations: Redshift dc2 vs ra3 node type
- Performance impact of feature: Redshift AQUA vs Redshift WLM
- Right tool for the job selection: Athena vs Redshift for given workload
- [Registering your custom platform](./cdk-stack/platforms): Redshift vs My Own Database
- [Registering your custom workload](./cdk-stack/workloads): My own dataset vs Redshift

Benchmarking tool supports below combinations as experiment

- Supported platforms:
    - [Redshift](./cdk-stack/platforms/redshift)
    - [Redshift Spectrum](./cdk-stack/platforms/redshift)
- Supported workloads:
    - [TPC-DS/v3](./cdk-stack/workloads/tpc-ds)

## 🎒 Pre-requisites

- [mvn](https://maven.apache.org/install.html) with JDK 8 in PATH
- [npm](https://nodejs.org/en/download/)
- cdk cli: `npm install -g aws-cdk`

## 🎮 Deployment

With aws cdk cli installed, go to the folder named cdk-stack & run deploy

```shell
cd cdk-stack && ./deploy.sh
```

Once `BenchmarkingStack` is deployed successfully run cli-wizard.

```shell
cd cli-wizard
npm run build && npm run wizard
```

## See Also

- [Architectural & design concepts](./Concepts.md) driving this project
- [Benchmarking Stack](./cdk-stack) infrastructure
- [Cli Wizard](./cli-wizard)
- How to [add new platform support](./cdk-stack/platforms)
- How to [add new workload support](./cdk-stack/workloads)
