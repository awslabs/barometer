import {Aws, Construct, Duration, Environment} from "@aws-cdk/core";
import {Code, FileSystem, DockerImageCode, DockerImageFunction, Function, Runtime} from "@aws-cdk/aws-lambda";
import {Bucket} from "@aws-cdk/aws-s3";
import {Vpc} from "@aws-cdk/aws-ec2";
import {Policy, PolicyDocument, PolicyStatement} from "@aws-cdk/aws-iam";
import {Topic} from "@aws-cdk/aws-sns";
import {AccessPoint} from '@aws-cdk/aws-efs';
import {Table} from "@aws-cdk/aws-dynamodb";
import {LambdaSubscription} from "@aws-cdk/aws-sns-subscriptions";
import * as fs from "fs";
import {Key} from "@aws-cdk/aws-kms";
import {Utils} from "../utils";
import path = require('path');

interface CommonFunctionsProps {
    env?: Environment,
    dataBucket: Bucket;
    vpc: Vpc;
    stackUpdateTopic: Topic,
    dataTable: Table,
    key: Key,
    accessPoint : AccessPoint 
}


/**
 * Defines all common lambda functions
 */
export class CommonFunctions extends Construct {

    public readonly createDestroyPlatform: Function;
    public readonly dashboardBuilder: Function;
    public readonly platformLambdaProxy: Function;
    public readonly jdbcQueryRunner: Function;
    public readonly stepFunctionHelpers: Function;

    constructor(scope: Construct, id: string, props: CommonFunctionsProps) {
        super(scope, id);
        // Path to common-functions root folder
        const commonFunctionsDirPath: string = path.join(__dirname, '../../common-functions/');
        const platformDirPath: string = path.join(__dirname, '../../platforms/');

        this.createDestroyPlatform = new Function(this, "createDestroyPlatform", {
            code: Code.fromAsset(commonFunctionsDirPath + "create-destory-platform"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8,
            environment: {
                DataBucketName: props.dataBucket.bucketName,
                StackUpdateTopicArn: props.stackUpdateTopic.topicArn,
                DataTableName: props.dataTable.tableName
            },
            timeout: Duration.minutes(1)
        });
        // Allow lambda function to create cloudformation stack
        let resources = [props.key.keyArn, props.dataTable.tableArn, props.dataBucket.bucketArn, props.dataBucket.bucketArn + "/platforms/*/template.json", props.dataBucket.bucketArn + "/platforms/*/functions/*/code.zip"];
        let invokeFunctionResources = []
        let platforms = Utils.listPaths(platformDirPath, true);

        for (let i = 0; i < platforms.length; i++) {
            resources.push("arn:aws:cloudformation:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":stack/" + platforms[i] + "-*/*");
            invokeFunctionResources.push("arn:aws:lambda:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":function:" + platforms[i] + "-*");

            if (fs.existsSync(platformDirPath + platforms[i] + "/policy.json")) {
                let policyText = fs.readFileSync(platformDirPath + platforms[i] + "/policy.json", 'utf-8');
                if (props.env && props.env.region && props.env.account) {
                    policyText = policyText.replace(/\${AWS::Region}/g, props.env.region).replace(/\${AWS::AccountId}/g, props.env.account);
                }
                let policyDocument = PolicyDocument.fromJson(JSON.parse(policyText));
                this.createDestroyPlatform.role?.attachInlinePolicy(new Policy(this, platforms[i] + "-policy", {document: policyDocument}));
            }
        }

        this.createDestroyPlatform.addToRolePolicy(new PolicyStatement({
            actions: ["cloudformation:CreateStack", "cloudformation:DeleteStack", "cloudformation:DescribeStacks", "kms:CreateGrant", "kms:DescribeKey", "dynamodb:PutItem", "dynamodb:DeleteItem", "s3:GetObject", "s3:ListBucket"],
            resources: resources
        }));
        // Allow platform lambda function to R/W on DataTable
        props.key.grantEncryptDecrypt(this.createDestroyPlatform);
        // Allow lambda to forward publish permit to Cloudformation
        props.stackUpdateTopic.grantPublish(this.createDestroyPlatform);
        // Subscribe to stack create/delete progress events
        props.stackUpdateTopic.addSubscription(new LambdaSubscription(this.createDestroyPlatform));

        this.dashboardBuilder = new Function(this, "dashboardBuilder", {
            code: Code.fromAsset(commonFunctionsDirPath + "dashboard-builder"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8,
            environment: {
                SummaryDashboardName: "BenchmarkingExperimentsSummary",
                ExperimentDashboardPrefix: "BenchmarkingExperiment-"
            },
            timeout: Duration.minutes(1),
            vpc: props.vpc,
            filesystem: FileSystem.fromEfsAccessPoint(props.accessPoint, '/mnt/grafana'),
        });
        this.dashboardBuilder.addToRolePolicy(new PolicyStatement({
            actions: ["cloudwatch:GetDashboard", "cloudwatch:PutDashboard"],
            resources: ["arn:aws:cloudwatch::" + Aws.ACCOUNT_ID + ":dashboard/BenchmarkingExperimentsSummary", "arn:aws:cloudwatch::" + Aws.ACCOUNT_ID + ":dashboard/BenchmarkingExperiment-*"]
        }));

        this.platformLambdaProxy = new Function(this, "platformLambdaProxy", {
            code: Code.fromAsset(commonFunctionsDirPath + "platform-lambda-proxy"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8,
            environment: {
                DataTableName: props.dataTable.tableName,
                DataBucketName: props.dataBucket.bucketName
            },
            timeout: Duration.minutes(1)
        });
        this.platformLambdaProxy.addToRolePolicy(new PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: invokeFunctionResources
        }));
        this.platformLambdaProxy.addToRolePolicy(new PolicyStatement({
            actions: ["dynamodb:PutItem", "dynamodb:DeleteItem", "kms:Decrypt"],
            resources: [props.dataTable.tableArn, props.key.keyArn]
        }));

        this.jdbcQueryRunner = new DockerImageFunction(this, "jdbcQueryRunnerFn", {
            code: DockerImageCode.fromImageAsset(commonFunctionsDirPath + "jdbc-query-runner"),
            vpc: props.vpc,
            timeout: Duration.minutes(15),
            memorySize: 256
        });
        this.jdbcQueryRunner.addToRolePolicy(new PolicyStatement({
            actions: ["s3:GetObject", "s3:ListBucket", "kms:Decrypt"],
            resources: [props.dataBucket.bucketArn, props.dataBucket.bucketArn + "/*", props.key.keyArn, "arn:aws:s3:::redshift-downloads", "arn:aws:s3:::redshift-downloads/*"]
        }));
        this.jdbcQueryRunner.addToRolePolicy(new PolicyStatement({
            actions: ["cloudwatch:PutMetricData"],
            resources: ["*"],
            conditions: {
                "StringEquals": {
                    "cloudwatch:namespace": "Benchmarking"
                }
            }
        }));
        // Allow lambda function to read secrets from platform stacks
        this.jdbcQueryRunner.addToRolePolicy(new PolicyStatement({
            actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
            resources: ["arn:" + Aws.PARTITION + ":secretsmanager:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":secret:*"],
            conditions: {
                "StringEquals": {
                    "secretsmanager:ResourceTag/ManagedBy": "BenchmarkingStack"
                }
            }
        }));

        this.stepFunctionHelpers = new Function(this, "helpers", {
            code: Code.fromAsset(commonFunctionsDirPath + "stepfn-helpers"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8,
            timeout: Duration.minutes(1),
            environment: {
                "DataBucketName": props.dataBucket.bucketName
            }
        });
        this.stepFunctionHelpers.addToRolePolicy(new PolicyStatement({
            actions: ["s3:ListBucket"],
            resources: [props.dataBucket.bucketArn, "arn:aws:s3:::redshift-downloads"]
        }));
    }
}