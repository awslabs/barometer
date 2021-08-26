import {Construct, Duration} from "@aws-cdk/core";
import {CommonFunctions} from "./common-functions";
import {LambdaInvoke, StepFunctionsStartExecution} from "@aws-cdk/aws-stepfunctions-tasks";
import {Choice, Condition, IntegrationPattern, JsonPath, Map, Pass, StateMachine} from "@aws-cdk/aws-stepfunctions";
import {TaskInput} from "@aws-cdk/aws-stepfunctions/lib/input";
import {Policy, PolicyStatement} from "@aws-cdk/aws-iam";


interface ExperimentRunnerProps {
    commonFunctions: CommonFunctions;
    benchmarkRunnerWorkflow: StateMachine;
}

/**
 * Defines experiment runner workflow
 */
export class ExperimentRunner extends Construct {

    public readonly workflow: StateMachine;

    constructor(scope: Construct, id: string, props: ExperimentRunnerProps) {
        super(scope, id);

        // Define final end of workflow state
        let endState = new Pass(this, 'End', {comment: "Final end state"});

        // Step function helper lambda to fetch Map state items form userSecrets & sessionCount
        let getUserSessionAsMapItems = new LambdaInvoke(this, 'Get users times session items', {
            lambdaFunction: props.commonFunctions.stepFunctionHelpers,
            payload: TaskInput.fromObject({
                "method": "getUserSessionAsMapItems",
                "parameters": {
                    "sessionCount.$": "$.concurrentSessionCount",
                    "userSecrets.$": "$.platformLambdaOutput"
                }
            }),
            comment: "Prepare Map items for users defined in platform times user sessions defined in experiment",
            resultPath: "$.userSessionsOutput",
        });

        // Get user sessions & run benchmarking queries for each of them
        const runBenchmarkingForUsers = getUserSessionAsMapItems
            .next(new Map(this, 'User sessions', {
                maxConcurrency: 2, // TODO: Find a way to pass this dynamically based on $.concurrentSessionCount
                resultPath: JsonPath.DISCARD,
                itemsPath: "$.userSessionsOutput.Payload.userSessions",
                parameters: {
                    "workloadConfig.$": "$.workloadConfig",
                    "secretId.$": "$$.Map.Item.Value.secretId",
                    "sessionId.$": "$$.Map.Item.Value.sessionId"
                }
            }).iterator(new StepFunctionsStartExecution(this, 'Run Benchmarking', {
                stateMachine: props.benchmarkRunnerWorkflow,
                input: TaskInput.fromObject({
                    "workloadConfig.$": "$.workloadConfig",
                    "secretId.$": "$.secretId",
                    "sessionId.$": "$.sessionId"
                }),
                resultPath: JsonPath.DISCARD
            }))).next(new LambdaInvoke(this, 'Prepare Dashboards', {
                lambdaFunction: props.commonFunctions.dashboardBuilder,
                comment: "Prepares cloudwatch/quicksight dashboard to show recorded data to the user",
                resultPath: JsonPath.DISCARD,
            })).next(new Choice(this, 'Keep infrastructure?', {
                comment: "Take decision based on user's choice of keeping infrastructure after experiment run"
            }).when(Condition.booleanEquals("$.keepInfrastructure", false), new LambdaInvoke(this, 'No, Destroy platform', {
                lambdaFunction: props.commonFunctions.createDestroyPlatform,
                payload: TaskInput.fromObject({
                    "platformConfig.$": "$.platformConfig",
                    "destroy": true,
                    "token": JsonPath.taskToken
                }),
                timeout: Duration.minutes(15),
                retryOnServiceExceptions: false,
                integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
                comment: "Destroy platform based on user choice",
                resultPath: JsonPath.DISCARD
            }).next(endState))
                .otherwise(endState));

        // Full workflow step function definition
        const experimentRunnerDefinition = new LambdaInvoke(this, "Create platform if it doesn't exists", {
            lambdaFunction: props.commonFunctions.createDestroyPlatform,
            payload: TaskInput.fromObject({
                "platformConfig.$": "$.platformConfig",
                "destroy": false,
                "token": JsonPath.taskToken
            }),
            retryOnServiceExceptions: false,
            timeout: Duration.minutes(15),
            integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
            comment: "Create new platform based on input from caller CLI/UI",
            resultPath: "$.platformLambdaOutput"
        }).next(new LambdaInvoke(this, 'Fetch DDL SQL scripts S3 paths', {
            lambdaFunction: props.commonFunctions.stepFunctionHelpers,
            payload: TaskInput.fromObject({
                "method": "listS3Paths",
                "parameters": {
                    "basePath.$": "$.workloadConfig.settings.ddl.path",
                    "extension": ".sql"
                }
            }),
            comment: "Fetch DDL SQL scripts from S3 path as Map items",
            resultPath: "$.ddlScripts",
        })).next(new Map(this, 'Run all DDLs', {
            comment: "Runs all DDL scripts",
            itemsPath: "$.ddlScripts.Payload.paths",
            parameters: {
                "platformLambdaOutput.$": "$.platformLambdaOutput",
                "scriptPath.$": "$$.Map.Item.Value"
            },
            resultPath: JsonPath.DISCARD
        }).iterator(new LambdaInvoke(this, 'Run DDL Query', {
            lambdaFunction: props.commonFunctions.jdbcQueryRunner,
            payload: TaskInput.fromObject({
                "secretId.$": "$.platformLambdaOutput.secretIds[0]",
                "scriptPath.$": "$.scriptPath"
            }),
            comment: "Run DDL Query on platform",
            resultPath: JsonPath.DISCARD,
        }))).next(new Choice(this, 'Copy dataset to the platform?', {
            comment: "Evaluate user choice of copying dataset to the platform"
        }).when(Condition.stringEquals("$.workloadConfig.settings.loadMethod", "copy"), new LambdaInvoke(this, 'Yes, Run data copier', {
            lambdaFunction: props.commonFunctions.dataCopier,
            comment: "Copy dataset from workload config path to the platform",
            payload: TaskInput.fromObject({
                "secretId.$": "$.platformLambdaOutput.secretIds[0]",
                "dataset.$": "$.workloadConfig.settings.volume"
            }),
            resultPath: JsonPath.DISCARD,
        }).next(runBenchmarkingForUsers))
            .otherwise(runBenchmarkingForUsers));

        // Define step function flow
        this.workflow = new StateMachine(this, 'Workflow', {
            definition: experimentRunnerDefinition
        });

        let policy = new Policy(this, 'TaskStatusUpdatePolicy');
        policy.addStatements(
            new PolicyStatement({
                actions: ["states:SendTaskSuccess"],
                resources: [this.workflow.stateMachineArn]
            }));
        props.commonFunctions.createDestroyPlatform.role?.attachInlinePolicy(policy);
    }
}