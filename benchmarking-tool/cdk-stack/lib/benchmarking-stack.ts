import * as cdk from '@aws-cdk/core';
import {CfnOutput} from '@aws-cdk/core';
import {BlockPublicAccess, Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {Key} from "@aws-cdk/aws-kms";
import {CommonFunctions} from "./constructs/common-functions";
import {ExperimentRunner} from "./constructs/experiment-runner";
import {BenchmarkRunner} from "./constructs/benchmark-runner";
import {GatewayVpcEndpointAwsService, SubnetType, Vpc} from "@aws-cdk/aws-ec2";

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

        let commonFunctions = new CommonFunctions(this, 'CommonFunctions', {dataBucket: dataBucket, vpc: vpc});
        let benchmarkRunner = new BenchmarkRunner(this, 'BenchmarkRunner', {commonFunctions: commonFunctions});
        new ExperimentRunner(this, 'ExperimentRunner', {
            commonFunctions: commonFunctions,
            benchmarkRunnerWorkflow: benchmarkRunner.workflow
        });

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
        new CfnOutput(this, 'KMSKeyArn', {
            value: key.keyArn,
            exportName: "Benchmarking::KMSKey"
        });
        new CfnOutput(this, 'QueryRunnerSG', {
            value: commonFunctions.jdbcQueryRunner.connections.securityGroups.map(sg => sg.securityGroupId).join(","),
            exportName: "Benchmarking::Exec::SecurityGroup"
        });
    }
}
