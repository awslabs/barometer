import {Aws, Construct} from "@aws-cdk/core";
import {IntegrationPattern, JsonPath, StateMachine} from "@aws-cdk/aws-stepfunctions";
import {EcsFargateLaunchTarget, EcsRunTask} from "@aws-cdk/aws-stepfunctions-tasks";
import {Cluster} from "@aws-cdk/aws-ecs/lib/cluster";
import {Port, SecurityGroup, SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {
    ContainerDefinition,
    ContainerImage, CpuArchitecture,
    FargatePlatformVersion,
    FargateTaskDefinition,
    LogDriver, OperatingSystemFamily
} from "@aws-cdk/aws-ecs";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {Bucket} from "@aws-cdk/aws-s3";
import {IKey} from "@aws-cdk/aws-kms";
import {RetentionDays} from "@aws-cdk/aws-logs";
import path = require('path');


interface BenchmarkRunnerProps {
    dataBucket: Bucket;
    vpc: Vpc;
    key: IKey;
}

/**
 * Defines benchmark runner workflow
 */
export class BenchmarkRunner extends Construct {

    public readonly workflow: StateMachine;
    public readonly cluster: Cluster;
    public readonly queryRunnerSG: SecurityGroup;

    constructor(scope: Construct, id: string, props: BenchmarkRunnerProps) {
        super(scope, id);

        const commonFunctionsDirPath: string = path.join(__dirname, '../../common-functions/');

        this.cluster = new Cluster(this, 'EcsCluster', {
            enableFargateCapacityProviders: true,
            vpc: props.vpc
        });

        const taskDefinition = new FargateTaskDefinition(this, 'QueryRunnerTask', {
            cpu: 512,
            memoryLimitMiB: 1024,
            runtimePlatform: {
                cpuArchitecture: CpuArchitecture.X86_64,
                operatingSystemFamily: OperatingSystemFamily.LINUX
            }
        });
        taskDefinition.addToTaskRolePolicy(new PolicyStatement({
            actions: ["s3:GetObject", "s3:ListBucket", "kms:Decrypt"],
            resources: [props.dataBucket.bucketArn, props.dataBucket.bucketArn + "/*", props.key.keyArn, "arn:aws:s3:::redshift-downloads", "arn:aws:s3:::redshift-downloads/*"]
        }));
        taskDefinition.addToTaskRolePolicy(new PolicyStatement({
            actions: ["cloudwatch:PutMetricData"],
            resources: ["*"],
            conditions: {
                "StringEquals": {
                    "cloudwatch:namespace": "Benchmarking"
                }
            }
        }));
        // Allow ECS task to read secrets from platform stacks
        taskDefinition.addToTaskRolePolicy(new PolicyStatement({
            actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
            resources: ["arn:" + Aws.PARTITION + ":secretsmanager:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":secret:*"],
            conditions: {
                "StringEquals": {
                    "secretsmanager:ResourceTag/ManagedBy": "BenchmarkingStack"
                }
            }
        }));

        this.queryRunnerSG = new SecurityGroup(this, 'queryRunnerSG', {
            vpc: props.vpc
        });
        this.queryRunnerSG.addIngressRule(this.queryRunnerSG, Port.allTcp(), "Allow intranet self traffic routing")

        const benchmarkRunnerDefinition = new EcsRunTask(this, 'Run all queries for session', {
            cluster: this.cluster,
            launchTarget: new EcsFargateLaunchTarget({platformVersion: FargatePlatformVersion.LATEST}),
            taskDefinition: taskDefinition,
            integrationPattern: IntegrationPattern.RUN_JOB,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED},
            securityGroups: [this.queryRunnerSG],
            assignPublicIp: false,
            containerOverrides: [{
                containerDefinition: new ContainerDefinition(this, 'QueryRunner', {
                    image: ContainerImage.fromAsset(commonFunctionsDirPath + "jdbc-query-runner"),
                    taskDefinition: taskDefinition,
                    logging: LogDriver.awsLogs({
                        streamPrefix: "Benchmark-QueryRunner",
                        logRetention: RetentionDays.FIVE_DAYS
                    })
                }),
                environment: [
                    {name: 'secretId', value: JsonPath.stringAt("$.secretId")},
                    {name: 'driverClass', value: JsonPath.stringAt("$.driverClass")},
                    {name: 'sessionIds', value: JsonPath.jsonToString(JsonPath.stringAt("$.sessionIds"))},
                    {name: 'stackName', value: JsonPath.stringAt("$.stackName")},
                    {name: 'basePath', value: JsonPath.stringAt("$.basePath")},
                    {name: 'extension', value: JsonPath.stringAt("$.extension")},
                    {name: 'workloadConfigName', value: JsonPath.stringAt("$.workloadConfigName")},
                    {name: 'platformConfigName', value: JsonPath.stringAt("$.platformConfigName")},
                    {name: 'platformConfigPlatformType', value: JsonPath.stringAt("$.platformConfigPlatformType")},
                    {name: 'experimentName', value: JsonPath.stringAt("$.experimentName")}
                ]
            }],
            resultPath: JsonPath.DISCARD
        });

        this.workflow = new StateMachine(this, 'Workflow', {
            definition: benchmarkRunnerDefinition
        });
    }
}