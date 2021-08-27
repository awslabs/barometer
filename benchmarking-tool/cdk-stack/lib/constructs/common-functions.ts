import {Aws, Construct, Stack} from "@aws-cdk/core";
import {Code, Function, Runtime} from "@aws-cdk/aws-lambda";
import {Bucket} from "@aws-cdk/aws-s3";
import {Vpc} from "@aws-cdk/aws-ec2";
import {Policy, PolicyDocument, PolicyStatement} from "@aws-cdk/aws-iam";
import {Topic} from "@aws-cdk/aws-sns";
import {Table} from "@aws-cdk/aws-dynamodb";
import {LambdaSubscription} from "@aws-cdk/aws-sns-subscriptions";
import * as fs from "fs";
import {Key} from "@aws-cdk/aws-kms";

const path = require('path');

interface CommonFunctionsProps {
    dataBucket: Bucket;
    vpc: Vpc;
    stackUpdateTopic: Topic,
    dataTable: Table,
    key: Key
}


/**
 * Defines all common lambda functions
 */
export class CommonFunctions extends Construct {

    public readonly createDestroyPlatform: Function;
    public readonly dashboardBuilder: Function;
    public readonly dataCopier: Function;
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
            }
        });
        // Allow lambda function to create cloudformation stack
        let resources = [props.key.keyArn];
        let platforms = getDirectories(platformDirPath);
        for (let i = 0; i < platforms.length; i++) {
            resources.push("arn:aws:cloudformation:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":stack/" + platforms[i] + "-*/*");
            if (fs.existsSync(platformDirPath + platforms[i] + "/policy.json")) {
                let policyText = fs.readFileSync(platformDirPath + platforms[i] + "/policy.json", 'utf-8');
                let policyDocument = PolicyDocument.fromJson(JSON.parse(policyText));
                this.createDestroyPlatform.role?.attachInlinePolicy(new Policy(this, platforms[i] + "-policy", {document: policyDocument}));
            }
        }
        this.createDestroyPlatform.addToRolePolicy(new PolicyStatement({
            actions: ["cloudformation:CreateStack", "cloudformation:DeleteStack", "cloudformation:DescribeStacks", "kms:CreateGrant"],
            resources: resources
        }));
        // Allow lambda function to read templates from S3 bucket
        props.dataBucket.grantRead(this.createDestroyPlatform);
        // Allow platform lambda function to R/W on DataTable
        props.dataTable.grantReadWriteData(this.createDestroyPlatform);
        // Allow lambda to forward publish permit to Cloudformation
        props.stackUpdateTopic.grantPublish(this.createDestroyPlatform);
        // Subscribe to stack create/delete progress events
        props.stackUpdateTopic.addSubscription(new LambdaSubscription(this.createDestroyPlatform));

        this.dashboardBuilder = new Function(this, "dashboardBuilder", {
            code: Code.fromAsset(commonFunctionsDirPath + "dashboard-builder"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });

        this.dataCopier = new Function(this, "dataCopier", {
            code: Code.fromAsset(commonFunctionsDirPath + "data-copier"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });

        this.jdbcQueryRunner = new Function(this, "jdbcQueryRunner", {
            code: Code.fromAsset(commonFunctionsDirPath + "jdbc-query-runner"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8,
            vpc: props.vpc
        });

        this.stepFunctionHelpers = new Function(this, "helpers", {
            code: Code.fromAsset(commonFunctionsDirPath + "stepfn-helpers"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });
    }
}

function getDirectories(path: string) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}