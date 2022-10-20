import {Aws, Construct} from "@aws-cdk/core";
import {Code, Connection, ConnectionType, GlueVersion, Job, JobExecutable} from "@aws-cdk/aws-glue";
import {IBucket} from "@aws-cdk/aws-s3";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {IVpc, SecurityGroup} from "@aws-cdk/aws-ec2";
import path = require('path');
import fs = require('fs');

interface GenericDataCopierProps {
    dataBucket: IBucket
    vpc: IVpc
    queryRunnerSG: SecurityGroup
}

export class GenericDataCopier extends Construct {

    readonly job: Job

    constructor(scope: Construct, id: string, props: GenericDataCopierProps) {
        super(scope, id);

        // Path to cdk root folder
        const cdkRootPath: string = path.join(__dirname, '../../');

        const extraJars: Array<Code> = []
        fs.readFileSync(cdkRootPath + "platforms/drivers.txt", "utf-8").split(/\r?\n/).forEach(line => {
            if (line)
                extraJars.push(Code.fromBucket(props.dataBucket, "libs/" + line.split('/').pop()));
        });

        this.job = new Job(this, 'Job', {
            maxConcurrentRuns: 5,
            connections: [new Connection(this, 'connection', {
                type: ConnectionType.NETWORK,
                description: "Network route to reach to the platform via barometer VPC Subnets",
                subnet: props.vpc.isolatedSubnets[0],
                securityGroups: [props.queryRunnerSG]
            })],
            executable: JobExecutable.scalaEtl({
                className: "GenericDataCopyJob",
                glueVersion: GlueVersion.V3_0,
                script: Code.fromAsset(cdkRootPath + "GenericDataCopyJob.scala"),
                extraJars: extraJars
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
    }
}