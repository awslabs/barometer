import {Construct} from "@aws-cdk/core";
import {Code, GlueVersion, Job, JobExecutable, PythonVersion} from "@aws-cdk/aws-glue";
import path = require('path');
import {IBucket} from "@aws-cdk/aws-s3";

interface GenericDataCopierProps {
    dataBucket: IBucket
}

export class GenericDataCopier extends Construct {

    readonly job: Job

    constructor(scope: Construct, id: string, props: GenericDataCopierProps) {
        super(scope, id);

        // Path to common-functions root folder
        const cdkRootPath: string = path.join(__dirname, '../../');

        this.job = new Job(this, 'Job', {
            executable: JobExecutable.scalaEtl({
                className: "GenericDataCopyJob",
                glueVersion: GlueVersion.V3_0,
                script: Code.fromAsset(cdkRootPath + "GenericDataCopyJob.scala"),
                extraJars: [Code.fromBucket(props.dataBucket, "libs/redshift-jdbc42-2.1.0.9.jar"), Code.fromBucket(props.dataBucket, "libs/AthenaJDBC42_2.0.27.1001.jar")]
            })
        });
    }
}