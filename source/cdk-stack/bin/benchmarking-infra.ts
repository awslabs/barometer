#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {BenchmarkingStack} from "../lib/benchmarking-stack";


const app = new cdk.App();
new BenchmarkingStack(app, 'BenchmarkingStack', {
    description: "uksb-1tmk781t2",
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
    }
});
