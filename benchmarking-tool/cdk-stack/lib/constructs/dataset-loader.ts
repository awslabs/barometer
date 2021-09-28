import {Construct} from "@aws-cdk/core";
import {Bucket} from "@aws-cdk/aws-s3";
import {Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {BlockDeviceVolume} from "@aws-cdk/aws-ec2/lib/volume";
import {Key} from "@aws-cdk/aws-kms";
import * as fs from "fs";
import * as path from "path";

interface DatasetLoaderProps {
    dataBucket: Bucket
    vpc: Vpc,
    key: Key
}

/**
 * Loads TPC-DS data to s3 bucket
 */
export class DatasetLoader extends Construct {
    constructor(scope: Construct, id: string, props: DatasetLoaderProps) {
        super(scope, id);

        const userData = fs.readFileSync(path.join(__dirname, '../../userdata.sh'), 'utf-8').replace(/#BUCKET#/g, props.dataBucket.bucketName).split("\n");

        const instance = new Instance(this, 'Instance', {
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            machineImage: MachineImage.latestAmazonLinux(),
            vpc: props.vpc,
            vpcSubnets: {subnetType: SubnetType.PRIVATE_ISOLATED},
            userDataCausesReplacement: true,
            blockDevices: [{
                deviceName: "/dev/xvda",
                volume: BlockDeviceVolume.ebs(20, {
                    encrypted: true,
                    deleteOnTermination: true
                })
            }]
        });
        instance.addUserData(...userData);
        instance.addToRolePolicy(new PolicyStatement({
            actions: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
            resources: [
                props.dataBucket.bucketArn,
                props.dataBucket.bucketArn + "/tools/TPC-DSGen-software-code-3.2.0rc1.zip",
                props.dataBucket.bucketArn + "/datasets/*"
            ]
        }));
        props.key.grantEncryptDecrypt(instance);
    }
}