import {IBucket} from "aws-cdk-lib/aws-s3";
import {Construct} from "constructs";
import {
    Choice,
    Condition, Fail,
    IntegrationPattern,
    JsonPath,
    Pass,
    StateMachine,
    Wait,
    WaitTime
} from "aws-cdk-lib/aws-stepfunctions";
import {PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {IKey} from "aws-cdk-lib/aws-kms";
import {Aws, Duration} from "aws-cdk-lib";
import {CallAwsService} from "aws-cdk-lib/aws-stepfunctions-tasks";


interface DataImporterProps {
    dataBucket: IBucket;
    manifestBucket: IBucket;
    encryptionKey: IKey,
}

export class BucketToBucketDataImporter extends Construct {
    public readonly workflow: StateMachine;

    constructor(scope: Construct, id: string, props: DataImporterProps) {
        super(scope, id);

        // Role for s3 copy job
        const role = new Role(this, 'ImportJobRole', {
            assumedBy: new ServicePrincipal("batchoperations.s3.amazonaws.com")
        });
        role.addToPolicy(new PolicyStatement({
            actions: ["s3:GetObject", "s3:ListBucket"],
            resources: ["arn:aws:s3:::redshift-downloads", "arn:aws:s3:::redshift-downloads/*"]
        }));
        role.addToPolicy(new PolicyStatement({
            actions: ["s3:GetObject", "s3:GetObjectVersion", "s3:ListBucket", "s3:GetBucketLocation"],
            resources: [props.manifestBucket.bucketArn, props.manifestBucket.bucketArn + "/*"]
        }));
        role.addToPolicy(new PolicyStatement({
            actions: ["s3:PutObject"],
            resources: [props.dataBucket.bucketArn + "/imported/*"]
        }));
        props.encryptionKey.grantEncryptDecrypt(role);


        // Define final end of workflow state
        let endState = new Pass(this, 'Job Succeeded', {comment: "Final end state"});

        // Wait and repeat flow
        const pollStatus = new Wait(this, 'Wait 1 minute', {
            time: WaitTime.duration(Duration.minutes(1))
        }).next(new CallAwsService(this, 'Check job status', {
            action: "describeJob",
            service: "s3control",
            iamAction: "s3:DescribeJob",
            iamResources: ["*"],
            parameters: {
                AccountId: Aws.ACCOUNT_ID,
                JobId: JsonPath.stringAt("$.Job.JobId")
            }
        }));
        pollStatus.next(new Choice(this, 'Job completed?')
            .when(Condition.stringEquals(JsonPath.stringAt("$.Job.Status"), "Complete"), endState)
            .when(Condition.or(Condition.stringEquals(JsonPath.stringAt("$.Job.Status"), "Failed"),
                Condition.stringEquals(JsonPath.stringAt("$.Job.Status"), "Cancelled"),
                Condition.stringEquals(JsonPath.stringAt("$.Job.Status"), "Suspended")), new Fail(this, 'Job Failed'))
            .otherwise(pollStatus))

        // Create task to submit s3 copy job
        const dataImporter = new CallAwsService(this, 'Fetch manifest ETag', {
            action: "headObject",
            iamResources: [props.manifestBucket.bucketArn + "/*"],
            service: "s3",
            iamAction: "s3:GetObject",
            parameters: {
                Bucket: props.manifestBucket.bucketName,
                Key: JsonPath.stringAt("$.manifestFileKey")
            },
            integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
            resultPath: "$.manifestETagOutput"
        }).next(new CallAwsService(this, 'Submit s3 copy job', {
            action: "createJob",
            service: "s3control",
            iamAction: "s3:CreateJob",
            parameters: {
                AccountId: Aws.ACCOUNT_ID,
                Operation: {
                    S3PutObjectCopy: {
                        TargetResource: props.dataBucket.bucketArn,
                        TargetKeyPrefix: "imported"
                    }
                },
                Manifest: {
                    Spec: {Format: "S3BatchOperations_CSV_20180820", Fields: ["Bucket", "Key"]},
                    Location: {
                        ObjectArn: JsonPath.format("{}/{}", props.manifestBucket.bucketArn, JsonPath.stringAt("$.manifestFileKey")),
                        ETag: JsonPath.stringAt("$.manifestETagOutput.ETag")
                    }
                },
                Report: {
                    Enabled: false
                },
                Priority: 1,
                RoleArn: role.roleArn,
                ConfirmationRequired: false,
                ClientRequestToken: JsonPath.stringAt("$$.Execution.Name")
            },
            iamResources: ["*"],
            integrationPattern: IntegrationPattern.REQUEST_RESPONSE,
            resultPath: "$.Job"
        })).next(pollStatus);

        this.workflow = new StateMachine(this, 'Workflow', {
            definition: dataImporter,
            timeout: Duration.hours(1)
        });
        role.grantPassRole(this.workflow.role);
    }
}