#!/usr/bin/env node
import 'source-map-support/register';
import {BenchmarkingStack} from "../lib/benchmarking-stack";
import {BenchmarkingStackQuickSight} from "../lib/benchmarkingquicksight-stack";
import {DescribeAccountSettingsCommand, QuickSightClient} from "@aws-sdk/client-quicksight";
import {App} from "aws-cdk-lib";

const app = new App();


var quicksightadminregion = (process.env.CDK_DEFAULT_REGION as string)

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-quicksight/classes/describeaccountsettingscommand.html
// https://github.com/aws/aws-sdk-js-v3#getting-started
const quicksightClient = new QuickSightClient({region: process.env.CDK_DEPLOY_REGION});
// const client = new QuickSightClient(config);
// const command = new DescribeAccountSettingsCommand(input);
// const response = await client.send(command);
var params = {
    AwsAccountId: process.env.CDK_DEFAULT_ACCOUNT /* required */
};
const command = new DescribeAccountSettingsCommand(params);

quicksightClient.send(command).then(
    (data) => {
        console.log(data)
        generatestacks((process.env.CDK_DEPLOY_REGION as string));
    },
    (error) => {
        //console.log("___ERROR___")
        //console.log(error.name)
        const quicksightavailableregions = ["ap-northeast-1", "ap-northeast-2", "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ca-central-1", "eu-central-1", "eu-north-1", "eu-west-1", "eu-west-2", "eu-west-3", "sa-east-1", "us-east-1", "us-east-2", "us-gov-west-1", "us-west-2"];
        if (error.name == 'AccessDeniedException') {
            //example of expected error message format : Operation is being called from endpoint eu-central-1, but your identity region is eu-west-1. Please use the eu-west-1 endpoint.
            try {
                //console.log("parsed region : " + error.message.split("Please use the ")[1].replace(" endpoint.",""));
                quicksightadminregion = error.message.split("Please use the ")[1].replace(" endpoint.", "");
                if (quicksightavailableregions.includes(quicksightadminregion)) {
                    generatestacks(quicksightadminregion);
                } else {
                    throw new Error("The Quicksight admin region is not found.");
                }
            } catch {
                throw new Error("The Quicksight admin region is not found.");
            }
        }
    }
);

function generatestacks(quicksightAdminRegion: string) {
    //console.log("generate stacks");
    const benchmarkingstackquicksight = new BenchmarkingStackQuickSight(app, 'BenchmarkingStackQuickSight', {
        description: "Baromter QuickSight custom ressources",
        env: {
            account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
            region: quicksightadminregion
        }
    });
    const benchmarkingstack = new BenchmarkingStack(app, 'BenchmarkingStack', {
        description: "uksb-1tmk781t2",
        env: {
            account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
        },
        quicksightadminregion: quicksightAdminRegion
    })
    benchmarkingstack.addDependency(benchmarkingstackquicksight);
}

//console.log("quicksight region : " + quicksightregion);
//console.log("______2_____");
//console.log(quicksightDescribeAccountSettings);
//import { setTimeout } from 'timers/promises';

// non blocking wait for 5 secs
//setTimeout(5 * 1000); 

// new BenchmarkingStack(app, 'BenchmarkingStack', {
//     description: "uksb-1tmk781t2",
//     env: {
//         account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
//         region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
//     }
// });
