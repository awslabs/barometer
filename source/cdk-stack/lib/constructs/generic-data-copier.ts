import {Aws, Construct} from "@aws-cdk/core";
import {Code, Connection, ConnectionType, GlueVersion, Job, JobExecutable, PythonVersion} from "@aws-cdk/aws-glue";
import {IBucket} from "@aws-cdk/aws-s3";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {IVpc, SecurityGroup} from "@aws-cdk/aws-ec2";
import path = require('path');
import {IKey} from "@aws-cdk/aws-kms";

interface GenericDataCopierProps {
    dataBucket: IBucket
    vpc: IVpc
    queryRunnerSG: SecurityGroup
    key: IKey
}

export class GenericDataCopier extends Construct {

    readonly job: Job

    constructor(scope: Construct, id: string, props: GenericDataCopierProps) {
        super(scope, id);

        // Path to cdk root folder
        const cdkRootPath: string = path.join(__dirname, '../../');

        this.job = new Job(this, 'Job', {
            maxConcurrentRuns: 5,
            connections: [new Connection(this, 'connection', {
                type: ConnectionType.NETWORK,
                description: "Network route to reach to the platform via barometer VPC Subnets",
                subnet: props.vpc.isolatedSubnets[0],
                securityGroups: [props.queryRunnerSG]
            })],
            executable: JobExecutable.pythonEtl({
                pythonVersion: PythonVersion.THREE,
                glueVersion: GlueVersion.V3_0,
                script: Code.fromAsset(cdkRootPath + "GenericDataCopyJob.py")
            })
        });
        this.job.grantPrincipal.addToPrincipalPolicy(new PolicyStatement({
            actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
            resources: ["arn:" + Aws.PARTITION + ":secretsmanager:" + Aws.REGION + ":" + Aws.ACCOUNT_ID + ":secret:*"],
            conditions: {
                "StringEquals": {
                    "secretsmanager:ResourceTag/ManagedBy": "BenchmarkingStack"
                }
            }
        }));
        props.key.grantDecrypt(this.job);
    }
}