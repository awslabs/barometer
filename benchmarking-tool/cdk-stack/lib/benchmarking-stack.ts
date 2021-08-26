import * as cdk from '@aws-cdk/core';
import {CfnOutput} from '@aws-cdk/core';
import {BlockPublicAccess, Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {Key} from "@aws-cdk/aws-kms";
import {CommonFunctions} from "./constructs/common-functions";
import {ExperimentRunner} from "./constructs/experiment-runner";
import {BenchmarkRunner} from "./constructs/benchmark-runner";
import {GatewayVpcEndpointAwsService, SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {Topic} from "@aws-cdk/aws-sns";
import {AttributeType, BillingMode, Table, TableEncryption} from "@aws-cdk/aws-dynamodb";

/**
 * Defines benchmarking tool core infrastructure (Benchmarking Framework)
 */
export class BenchmarkingStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Define new VPC for query runner lambda
        let vpc = new Vpc(this, 'BenchmarkingVPC', {
            enableDnsHostnames: true,
            enableDnsSupport: true,
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration: [{
                name: "Private",
                subnetType: SubnetType.ISOLATED
            }],
            gatewayEndpoints: {
                "S3": {
                    service: GatewayVpcEndpointAwsService.S3,
                    subnets: [{subnetType: SubnetType.ISOLATED}]
                }
            }
        });

        // Define new KMS Key. Used for all enc/dec for Benchmarking framework
        let key = new Key(this, "Key", {enableKeyRotation: true});

        // Create common S3 bucket to load/copy Workload dataset from source bucket
        let dataBucket = new Bucket(this, "DataBucket", {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL, // No public access to the bucket or object within it
            encryption: BucketEncryption.KMS, // Encryption at rest
            encryptionKey: key,
            enforceSSL: true, // Encryption in transit
            bucketKeyEnabled: true // Save costs by providing bucket hint that all objects will be encrypted by given key only
        });

        let sns = new Topic(this, 'StackUpdate', {masterKey: key});
        // DynamoDB table to store task token values for async integrations
        let dataTable = new Table(this, 'DataTable', {
            partitionKey: {
                name: "PK",
                type: AttributeType.STRING
            },
            encryption: TableEncryption.CUSTOMER_MANAGED,
            encryptionKey: key,
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        let commonFunctions = new CommonFunctions(this, 'CommonFunctions', {
            dataBucket: dataBucket,
            vpc: vpc,
            stackUpdateTopic: sns,
            dataTable: dataTable
        });
        let benchmarkRunner = new BenchmarkRunner(this, 'BenchmarkRunner', {commonFunctions: commonFunctions});
        new ExperimentRunner(this, 'ExperimentRunner', {
            commonFunctions: commonFunctions,
            benchmarkRunnerWorkflow: benchmarkRunner.workflow
        });

        let today = new Date().toISOString().slice(0, 10);

        new CfnOutput(this, 'DataBucketName', {
            value: dataBucket.bucketName,
            exportName: "Benchmarking::DataBucketName"
        });
        new CfnOutput(this, 'VpcId', {
            value: vpc.vpcId,
            exportName: "Benchmarking::VpcId"
        });
        new CfnOutput(this, 'SubnetIds', {
            value: vpc.isolatedSubnets.map(sub => sub.subnetId).join(","),
            exportName: "Benchmarking::SubnetIds"
        });
        new CfnOutput(this, 'KMSKeyId', {
            value: key.keyId,
            exportName: "Benchmarking::KMSKey"
        });
        new CfnOutput(this, 'QueryRunnerSG', {
            value: commonFunctions.jdbcQueryRunner.connections.securityGroups.map(sg => sg.securityGroupId).join(","),
            exportName: "Benchmarking::Exec::SecurityGroup"
        });
        new CfnOutput(this, 'CostExplorer', {
            value: "https://console.aws.amazon.com/cost-management/home?#/custom?groupBy=Service&hasBlended=false&hasAmortized=false&excludeDiscounts=true&excludeTaggedResources=false&excludeCategorizedResources=false&excludeForecast=false&timeRangeOption=Custom&granularity=Daily&reportName=&reportType=CostUsage&isTemplate=true&startDate=" + today + "&endDate=" + today + "&filter=%5B%7B%22dimension%22:%22TagKeyValue%22,%22values%22:null,%22include%22:true,%22children%22:%5B%7B%22dimension%22:%22aws:cloudformation:stack-name%22,%22values%22:%5B%22BenchmarkingStack%22%5D,%22include%22:true,%22children%22:null%7D%5D%7D,%7B%22dimension%22:%22RecordType%22,%22values%22:%5B%22Refund%22,%22Credit%22%5D,%22include%22:false,%22children%22:null%7D%5D&forecastTimeRangeOption=None&usageAs=usageQuantity&chartStyle=Stack"
        })
    }
}
