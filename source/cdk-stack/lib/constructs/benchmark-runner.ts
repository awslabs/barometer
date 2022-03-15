import {Aws, Construct} from "@aws-cdk/core";
import {IntegrationPattern, JsonPath, StateMachine} from "@aws-cdk/aws-stepfunctions";
import {EcsFargateLaunchTarget, EcsRunTask} from "@aws-cdk/aws-stepfunctions-tasks";
import {Cluster} from "@aws-cdk/aws-ecs/lib/cluster";
import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {ContainerDefinition, ContainerImage, FargatePlatformVersion, FargateTaskDefinition} from "@aws-cdk/aws-ecs";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {Bucket} from "@aws-cdk/aws-s3";
import {IFunction} from "@aws-cdk/aws-lambda";
import {IKey} from "@aws-cdk/aws-kms";
import path = require('path');


interface BenchmarkRunnerProps {
    dataBucket: Bucket;
    vpc: Vpc;
    jdbcQueryRunnerFunction: IFunction;
    key: IKey;
}

/**
 * Defines benchmark runner workflow
 */
export class BenchmarkRunner extends Construct {

    public readonly workflow: StateMachine;

    constructor(scope: Construct, id: string, props: BenchmarkRunnerProps) {
        super(scope, id);

        const commonFunctionsDirPath: string = path.join(__dirname, '../../common-functions/');

        const ecsCluster = new Cluster(this, 'EcsCluster', {
            enableFargateCapacityProviders: true,
            vpc: props.vpc
        });

        const taskDefinition = new FargateTaskDefinition(this, 'QueryRunnerTask', {cpu: 256, memoryLimitMiB: 512});
        taskDefinition.addToTaskRolePolicy(new PolicyStatement({
            actions: ["s3:GetObject", "s3:ListBucket", "kms:Decrypt"],
            resources: [props.dataBucket.bucketArn, props.dataBucket.bucketArn + "/*", props.key.keyArn]
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
        // Allow lambda function to read secrets from platform stacks
        taskDefinition.addToTaskRolePolicy(new PolicyStatement({
            actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
            resources: ["arn:" + Aws.PARTITION + ":secretsmanager:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":secret:*"],
            conditions: {
                "StringEquals": {
                    "secretsmanager:ResourceTag/ManagedBy": "BenchmarkingStack"
                }
            }
        }));

        const benchmarkRunnerDefinition = new EcsRunTask(this, 'Run all queries for session', {
            cluster: ecsCluster,
            launchTarget: new EcsFargateLaunchTarget({platformVersion: FargatePlatformVersion.LATEST}),
            taskDefinition: taskDefinition,
            integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
            subnets: {subnetType: SubnetType.PRIVATE_ISOLATED},
            securityGroups: props.jdbcQueryRunnerFunction.connections.securityGroups,
            assignPublicIp: false,
            containerOverrides: [{
                containerDefinition: new ContainerDefinition(this, 'QueryRunner', {
                    image: ContainerImage.fromAsset(commonFunctionsDirPath + "jdbc-query-runner"),
                    taskDefinition: taskDefinition
                }),
                command: ["java -classpath lib/*:. com.aws.benchmarking.jdbcqueryrunner.ContainerHandler"],
                environment: [
                    {name: 'secretId', value: JsonPath.stringAt("$.secretId")},
                    {name: 'sessionId', value: JsonPath.stringAt("$.sessionId")},
                    {name: 'stackName', value: JsonPath.stringAt("$.stackName")},
                    {name: 'queries', value: JsonPath.jsonToString(JsonPath.listAt("$.queries"))}
                ]
            }],
            resultPath: JsonPath.DISCARD
        });

        this.workflow = new StateMachine(this, 'Workflow', {
            definition: benchmarkRunnerDefinition
        });
    }
}