import * as cdk from '@aws-cdk/core';
import {Aws, Construct, Duration, Environment} from "@aws-cdk/core"; 
import * as quicksight from '@aws-cdk/aws-quicksight';
import * as cr from '@aws-cdk/custom-resources'; 
import * as iam from '@aws-cdk/aws-iam'; 
import * as logs from '@aws-cdk/aws-logs'; 
/**
 * Defines benchmarking tool core infrastructure (Benchmarking Framework)
 */
export class BenchmarkingStackQuickSight extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const QuickSightGroupName='barometer'
        const quicksightCreateGroupCall: cr.AwsSdkCall = { 
            service: "QuickSight", 
            action: "createGroup", 
            parameters: {  AwsAccountId: Aws.ACCOUNT_ID ,
                          GroupName: QuickSightGroupName, 
                          Namespace: 'default', }, 
            physicalResourceId: cr.PhysicalResourceId.of(`quicksightcreategroupname`), //
          }; 

        const quicksightCreategroup = new cr.AwsCustomResource( 
            this, 
            "QuickSightCreateGroup", 
            {  
                policy: cr.AwsCustomResourcePolicy.fromStatements([ 
                new iam.PolicyStatement({ 
                    effect: iam.Effect.ALLOW, 
                    resources: ["*"], 
                    actions: ["quicksight:CreateGroup"], 
                }), 
                ]), 
                logRetention: logs.RetentionDays.ONE_DAY, 
                onCreate: quicksightCreateGroupCall, 
            } 
        ) ; 
        
        const quicksightDeleteGroupCall: cr.AwsSdkCall = { 
            service: "QuickSight", 
            action: "deleteGroup", 
            parameters: {  AwsAccountId: Aws.ACCOUNT_ID , 
                          GroupName: QuickSightGroupName, 
                          Namespace: 'default',}, 
            physicalResourceId: cr.PhysicalResourceId.of(`quicksightdeletegroupname`), //
          }; 
          
        const quicksightDeletegroup = new cr.AwsCustomResource( 
            this, 
            "QuickSightDeleteGroup", 
            {  
                policy: cr.AwsCustomResourcePolicy.fromStatements([ 
                new iam.PolicyStatement({ 
                    effect: iam.Effect.ALLOW, 
                    resources: ["*"], 
                    actions: ["quicksight:DeleteGroup"], 
                }), 
                ]), 
                logRetention: logs.RetentionDays.ONE_DAY, 
                onDelete: quicksightDeleteGroupCall, 
            } 
        ); 
    }
}
