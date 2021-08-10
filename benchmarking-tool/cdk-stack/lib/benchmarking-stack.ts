import * as cdk from '@aws-cdk/core';
import {BlockPublicAccess, Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {Key} from "@aws-cdk/aws-kms";
import {CommonFunctions} from "./common/common-functions";
import {ExperimentRunner} from "./common/experiment-runner";
import {BenchmarkRunner} from "./common/benchmark-runner";

/**
 * Defines benchmarking tool core infrastructure (Benchmarking Framework)
 */
export class BenchmarkingStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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

        let commonFunctions = new CommonFunctions(this, 'CommonFunctions', {dataBucket: dataBucket});
        let benchmarkRunner = new BenchmarkRunner(this, 'BenchmarkRunner', {commonFunctions: commonFunctions});
        new ExperimentRunner(this, 'ExperimentRunner', {
            commonFunctions: commonFunctions,
            benchmarkRunnerWorkflow: benchmarkRunner.workflow
        });
    }
}
