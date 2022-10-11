import {Construct} from "@aws-cdk/core";
import {Code, GlueVersion, Job, JobExecutable, PythonVersion} from "@aws-cdk/aws-glue";
import path = require('path');
import fs = require('fs');
import {IBucket} from "@aws-cdk/aws-s3";

interface GenericDataCopierProps {
    dataBucket: IBucket
}

export class GenericDataCopier extends Construct {

    readonly job: Job

    constructor(scope: Construct, id: string, props: GenericDataCopierProps) {
        super(scope, id);

        // Path to cdk root folder
        const cdkRootPath: string = path.join(__dirname, '../../');

        const extraJars: Array<Code> = []
        fs.readFileSync(cdkRootPath + "platforms/drivers.txt", "utf-8").split(/\r?\n/).forEach(line => {
            extraJars.push(Code.fromBucket(props.dataBucket, "libs/" + line.split('/').pop()));
        });

        this.job = new Job(this, 'Job', {
            maxConcurrentRuns: 5,
            executable: JobExecutable.scalaEtl({
                className: "GenericDataCopyJob",
                glueVersion: GlueVersion.V3_0,
                script: Code.fromAsset(cdkRootPath + "GenericDataCopyJob.scala"),
                extraJars: extraJars
            })
        });
    }
}