import {Aws, Stack, StackProps} from "aws-cdk-lib";
import {AwsCustomResource, AwsCustomResourcePolicy, AwsSdkCall, PhysicalResourceId} from "aws-cdk-lib/custom-resources";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Construct} from "constructs";

/**
 * Defines benchmarking tool core infrastructure (Benchmarking Framework)
 */
export class BenchmarkingStackQuickSight extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const QuickSightGroupName = 'barometer'
        const quicksightCreateGroupCall: AwsSdkCall = {
            service: "QuickSight",
            action: "createGroup",
            parameters: {
                AwsAccountId: Aws.ACCOUNT_ID,
                GroupName: QuickSightGroupName,
                Namespace: 'default',
            },
            physicalResourceId: PhysicalResourceId.of(`quicksightcreategroupname`), //
        };

        const quicksightCreategroup = new AwsCustomResource(
            this,
            "QuickSightCreateGroup",
            {
                policy: AwsCustomResourcePolicy.fromStatements([
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        resources: ["*"],
                        actions: ["quicksight:CreateGroup"],
                    }),
                ]),
                logRetention: RetentionDays.ONE_DAY,
                onCreate: quicksightCreateGroupCall,
            }
        );

        const quicksightDeleteGroupCall: AwsSdkCall = {
            service: "QuickSight",
            action: "deleteGroup",
            parameters: {
                AwsAccountId: Aws.ACCOUNT_ID,
                GroupName: QuickSightGroupName,
                Namespace: 'default',
            },
            physicalResourceId: PhysicalResourceId.of(`quicksightdeletegroupname`), //
        };

        const quicksightDeletegroup = new AwsCustomResource(
            this,
            "QuickSightDeleteGroup",
            {
                policy: AwsCustomResourcePolicy.fromStatements([
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        resources: ["*"],
                        actions: ["quicksight:DeleteGroup"],
                    }),
                ]),
                logRetention: RetentionDays.ONE_DAY,
                onDelete: quicksightDeleteGroupCall,
            }
        );
    }
}
