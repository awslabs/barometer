import * as cdk from '@aws-cdk/core';
import {CfnOutput, RemovalPolicy} from '@aws-cdk/core';
import {BlockPublicAccess, Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {Key} from "@aws-cdk/aws-kms";
import {CommonFunctions} from "./constructs/common-functions";
import {ExperimentRunner} from "./constructs/experiment-runner";
import {BenchmarkRunner} from "./constructs/benchmark-runner";
import {Visualization} from "./constructs/visualization";
import {
    GatewayVpcEndpointAwsService,
    InterfaceVpcEndpoint,
    InterfaceVpcEndpointAwsService,
    SubnetType,
    Vpc
} from "@aws-cdk/aws-ec2";
import {Topic} from "@aws-cdk/aws-sns";
import {AttributeType, BillingMode, Table, TableEncryption} from "@aws-cdk/aws-dynamodb";
import {BucketToBucketDataImporter} from "./constructs/bucket-to-bucket-data-importer";
import {GenericDataCopier} from "./constructs/generic-data-copier";
//import * as efs from '@aws-cdk/aws-efs';
import {AccessPoint, FileSystem, LifecyclePolicy, PerformanceMode, ThroughputMode} from '@aws-cdk/aws-efs';

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
            subnetConfiguration: [
                {
                    name: "Public",
                    subnetType: SubnetType.PUBLIC
                },
                {
                    name: "Private",
                    subnetType: SubnetType.PRIVATE_ISOLATED
                }
            ],
            gatewayEndpoints: {
                "S3": {
                    service: GatewayVpcEndpointAwsService.S3,
                    subnets: [{subnetType: SubnetType.PRIVATE_ISOLATED}]
                }
            }
        });

        new InterfaceVpcEndpoint(this, 'ECRDockerEndpoint', {
            service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        new InterfaceVpcEndpoint(this, 'ECREndpoint', {
            service: InterfaceVpcEndpointAwsService.ECR,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        new InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
            service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        new InterfaceVpcEndpoint(this, 'MonitoringEndpoint', {
            service: InterfaceVpcEndpointAwsService.CLOUDWATCH,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        new InterfaceVpcEndpoint(this, 'LogsEndpoint', {
            service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        new InterfaceVpcEndpoint(this, 'SSMMessagesEndpoint', {
            service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        new InterfaceVpcEndpoint(this, 'Ec2MessagesEndpoint', {
            service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        new InterfaceVpcEndpoint(this, 'SSMEndpoint', {
            service: InterfaceVpcEndpointAwsService.SSM,
            vpc: vpc,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED}
        });

        // Dashboard EFS for Grafana Docker
        let fileSystem = new FileSystem(this, 'EfsFileSystem', {
            vpc: vpc,
            encrypted: true,
            lifecyclePolicy: LifecyclePolicy.AFTER_14_DAYS,
            performanceMode: PerformanceMode.GENERAL_PURPOSE,
            throughputMode: ThroughputMode.BURSTING
        });

        let accessPoint = new AccessPoint(this, 'EfsAccessPoint', {
            fileSystem: fileSystem,
            path: '/var/lib/grafana',
            posixUser: {
                gid: '1000',
                uid: '1000'
            },
            createAcl: {
                ownerGid: '1000',
                ownerUid: '1000',
                permissions: '755'
            }
        });

        // Define new KMS Key. Used for all enc/dec for Benchmarking framework
        let key = new Key(this, "Key", {enableKeyRotation: true});

        // Create common S3 bucket to load/copy Workload dataset from source bucket
        let dataBucket = new Bucket(this, "DataBucket", {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL, // No public access to the bucket or object within it
            encryption: BucketEncryption.KMS, // Encryption at rest
            encryptionKey: key,
            autoDeleteObjects: true,
            enforceSSL: true, // Encryption in transit
            bucketKeyEnabled: true, // Save costs by providing bucket hint that all objects will be encrypted by given key only
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Manifest s3 bucket
        let manifestBucket = new Bucket(this, "ManifestBucket", {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL, // No public access to the bucket or object within it
            encryption: BucketEncryption.S3_MANAGED, // Encryption at rest
            autoDeleteObjects: true,
            enforceSSL: true, // Encryption in transit
            removalPolicy: RemovalPolicy.DESTROY
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
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        });

        let commonFunctions = new CommonFunctions(this, 'CommonFunctions', {
            env: props?.env,
            dataBucket: dataBucket,
            vpc: vpc,
            stackUpdateTopic: sns,
            dataTable: dataTable,
            key: key,
            accessPoint: accessPoint,
        });

        let benchmarkRunner = new BenchmarkRunner(this, 'BenchmarkRunner', {
            dataBucket: dataBucket,
            vpc: vpc,
            key: key
        });
        const dataImporter = new BucketToBucketDataImporter(this, 'DataImporter', {
            dataBucket: dataBucket,
            manifestBucket: manifestBucket,
            encryptionKey: key
        });

        let visualization = new Visualization(this, 'Visualization', {
            vpc: vpc,
            cluster: benchmarkRunner.cluster,
            filesystem: fileSystem,
            accesspoint: accessPoint,
        });

        fileSystem.connections.allowDefaultPortFrom(visualization.service);

        const experimentRunner = new ExperimentRunner(this, 'ExperimentRunner', {
            commonFunctions: commonFunctions,
            genericDataCopier: new GenericDataCopier(this, 'GenericDataCopier', {
                dataBucket: dataBucket,
                vpc: vpc,
                queryRunnerSG: benchmarkRunner.queryRunnerSG,
                key: key
            }),
            benchmarkRunnerWorkflow: benchmarkRunner.workflow,
            dataImporterWorkflow: dataImporter.workflow,
            dataTable: dataTable,
            key: key
        });

        let today = new Date().toISOString().slice(0, 10);

        new CfnOutput(this, 'DataBucketName', {
            value: dataBucket.bucketName,
            exportName: "Benchmarking::DataBucketName"
        });
        new CfnOutput(this, 'ManifestBucketName', {
            value: manifestBucket.bucketName
        });
        new CfnOutput(this, 'DataBucketArn', {
            value: dataBucket.bucketArn,
            exportName: "Benchmarking::DataBucketArn"
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
            value: benchmarkRunner.queryRunnerSG.securityGroupId,
            exportName: "Benchmarking::Exec::SecurityGroup"
        });
        new CfnOutput(this, 'ProxyLambdaArn', {
            value: commonFunctions.platformLambdaProxy.functionArn,
            exportName: "Benchmarking::Exec::ProxyFunctionArn"
        });
        new CfnOutput(this, 'ExperimentRunnerArn', {
            value: experimentRunner.workflow.stateMachineArn
        });
        new CfnOutput(this, 'CostExplorer', {
            value: "https://console.aws.amazon.com/cost-management/home?#/custom?groupBy=Service&hasBlended=false&hasAmortized=false&excludeDiscounts=true&excludeTaggedResources=false&excludeCategorizedResources=false&excludeForecast=false&timeRangeOption=Custom&granularity=Daily&reportName=&reportType=CostUsage&isTemplate=true&startDate=" + today + "&endDate=" + today + "&filter=%5B%7B%22dimension%22:%22TagKeyValue%22,%22values%22:null,%22include%22:true,%22children%22:%5B%7B%22dimension%22:%22aws:cloudformation:stack-name%22,%22values%22:%5B%22BenchmarkingStack%22%5D,%22include%22:true,%22children%22:null%7D%5D%7D,%7B%22dimension%22:%22RecordType%22,%22values%22:%5B%22Refund%22,%22Credit%22%5D,%22include%22:false,%22children%22:null%7D%5D&forecastTimeRangeOption=None&usageAs=usageQuantity&chartStyle=Stack"
        });
        new CfnOutput(this, 'GrafanaDashBoardURL', {
            value: visualization.applicationloadbalancer.loadBalancerDnsName,
            exportName: "Benchmarking::Exec::GrafanaDashBoardURL"
        });
        new CfnOutput(this, 'GrafanaAdminPasswordArn', {
            value: visualization.grafanaadminpasswordarn,//.secretFullArn!
            exportName: "Benchmarking::Exec::GrafanaAdminPasswordArn"
        });
    }
}
