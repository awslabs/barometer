import {Construct, Duration} from "@aws-cdk/core";
import {CommonFunctions} from "./common-functions";
import {
    DynamoAttributeValue, DynamoDeleteItem,
    DynamoGetItem,
    DynamoPutItem,
    LambdaInvoke,
    StepFunctionsStartExecution
} from "@aws-cdk/aws-stepfunctions-tasks";
import {Choice, Condition, IntegrationPattern, JsonPath, Map, Pass, StateMachine} from "@aws-cdk/aws-stepfunctions";
import {TaskInput} from "@aws-cdk/aws-stepfunctions/lib/input";
import {Policy, PolicyStatement} from "@aws-cdk/aws-iam";
import {Table} from "@aws-cdk/aws-dynamodb";
import {Key} from "@aws-cdk/aws-kms";


interface ExperimentRunnerProps {
    commonFunctions: CommonFunctions;
    benchmarkRunnerWorkflow: StateMachine;
    dataTable: Table;
    key: Key;
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
            .next(new LambdaInvoke(this, 'Fetch benchmarking SQL scripts S3 paths', {
                lambdaFunction: props.commonFunctions.stepFunctionHelpers,
                payload: TaskInput.fromObject({
                    "method": "listS3Paths",
                    "parameters": {
                        "basePath.$": "$.workloadConfig.settings.queries.path",
                        "extension": ".sql"
                    }
                }),
                comment: "Fetch DDL SQL scripts from S3 path as Map items",
                resultPath: "$.queries",
            }))
            .next(new Map(this, 'User sessions', {
                resultPath: JsonPath.DISCARD,
                itemsPath: "$.userSessionsOutput.Payload.userSessions",
                parameters: {
                    "stackName.$": "$.platformLambdaOutput.stackName",
                    "secretId.$": "$$.Map.Item.Value.secretId",
                    "sessionIds.$": "$$.Map.Item.Value.sessionIds",
                    "basePath.$": "$.workloadConfig.settings.queries.path"
                }
            }).iterator(new StepFunctionsStartExecution(this, 'Run Benchmarking', {
                stateMachine: props.benchmarkRunnerWorkflow,
                integrationPattern: IntegrationPattern.RUN_JOB,
                input: TaskInput.fromObject({
                    "secretId.$": "$.secretId",
                    "sessionIds.$": "$.sessionIds",
                    "stackName.$": "$.stackName",
                    "basePath.$": "$.basePath",
                    "extension": ".sql"
                }),
                resultPath: JsonPath.DISCARD
            }))).next(new LambdaInvoke(this, 'Prepare Dashboards', {
                lambdaFunction: props.commonFunctions.dashboardBuilder,
                comment: "Prepares cloudwatch/quicksight dashboard to show recorded data to the user",
                payload: TaskInput.fromObject({
                    "stackName.$": "$.platformLambdaOutput.stackName",
                    "userSessions.$": "$.userSessionsOutput.Payload.userSessions",
                    "experimentName.$": "States.Format('{}-{}',$.workloadConfig.settings.name, $.platformConfig.name)",
                    "queries.$": "$.queries.Payload.paths",
                    "ddlQueries.$": "$.ddlScripts.Payload.paths"
                }),
                resultPath: JsonPath.DISCARD,
            })).next(new Choice(this, 'Keep infrastructure?', {
                comment: "Take decision based on user's choice of keeping infrastructure after experiment run"
            }).when(Condition.booleanEquals("$.keepInfrastructure", false), new DynamoPutItem(this, 'Unmark data copy success', {
                item: {
                    "PK": DynamoAttributeValue.fromString(JsonPath.stringAt("$.copyKey.id")),
                    "DATA_COPIED": DynamoAttributeValue.fromBoolean(false)
                },
                table: props.dataTable,
                resultPath: JsonPath.DISCARD
            }).next(new LambdaInvoke(this, 'No, Destroy platform', {
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
            })).next(endState))
                .otherwise(endState));

        // Main experiment runner flow
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
        }))
            .next(new StepFunctionsStartExecution(this, 'Run all DDLs', {
                stateMachine: props.benchmarkRunnerWorkflow,
                integrationPattern: IntegrationPattern.RUN_JOB,
                input: TaskInput.fromObject({
                    "secretId.$": "$.platformLambdaOutput.secretIds[0]",
                    "sessionIds": ["DDL"],
                    "stackName.$": "$.platformLambdaOutput.stackName",
                    "basePath.$": "$.workloadConfig.settings.ddl.path",
                    "extension": ".sql"
                }),
                resultPath: JsonPath.DISCARD
            })).next(new Pass(this, 'Prepare unique copy key', {
                parameters: {
                    "id.$": "States.Format('{}#{}#copy',$.platformLambdaOutput.stackName,$.workloadConfig.settings.name)"
                },
                resultPath: "$.copyKey"
            })).next(new Choice(this, 'Copy dataset to the platform?', {
                comment: "Evaluate user choice of copying dataset to the platform"
            }).when(Condition.booleanEquals("$.platformConfig.loadDataset", true), new DynamoGetItem(this, 'Yes, Get data copy status', {
                key: {"PK": DynamoAttributeValue.fromString(JsonPath.stringAt("$.copyKey.id"))},
                table: props.dataTable,
                resultPath: "$.copyStatus"
            }).next(new Choice(this, 'Data already copied?', {
                comment: "Check if data already copied or not"
            }).when(Condition.or(Condition.isNotPresent("$.copyStatus.Item"), Condition.booleanEquals("$.copyStatus.Item.DATA_COPIED.BOOL", false)), new LambdaInvoke(this, 'No, Fetch list of tables to copy', {
                lambdaFunction: props.commonFunctions.stepFunctionHelpers,
                payload: TaskInput.fromObject({
                    "method": "listS3Directories",
                    "parameters": {
                        "basePath.$": "$.workloadConfig.settings.volume.path"
                    }
                }),
                comment: "Fetch DDL SQL scripts from S3 path as Map items",
                resultPath: "$.tablesToCopy",
            }).next(new Map(this, 'Parallel table copy', {
                comment: "Copy table in parallel",
                itemsPath: "$.tablesToCopy.Payload.paths",
                maxConcurrency: 5,
                parameters: {
                    "tableDataPath.$": "$$.Map.Item.Value",
                    "platformLambdaOutput.$": "$.platformLambdaOutput",
                    "volume.$": "$.workloadConfig.settings.volume"
                },
                resultPath: JsonPath.DISCARD,
            }).iterator(new LambdaInvoke(this, 'Run data copier', {
                lambdaFunction: props.commonFunctions.platformLambdaProxy,
                comment: "Copy dataset from table path to the platform",
                payload: TaskInput.fromObject({
                    "stackName.$": "$.platformLambdaOutput.stackName",
                    "lambdaFunction.$": "$.platformLambdaOutput.dataCopierLambda",
                    "proxyToken.$": "$.tableDataPath",
                    "proxyPayload": {
                        "secretId.$": "$.platformLambdaOutput.secretIds[0]",
                        "tableDataPath.$": "$.tableDataPath",
                        "volume.$": "$.volume",
                        "sessionId": "COPY"
                    },
                    "token": JsonPath.taskToken
                }),
                timeout: Duration.hours(1),
                integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
                resultPath: JsonPath.DISCARD,
            }))).next(new DynamoPutItem(this, 'Mark data copy success', {
                item: {
                    "PK": DynamoAttributeValue.fromString(JsonPath.stringAt("$.copyKey.id")),
                    "DATA_COPIED": DynamoAttributeValue.fromBoolean(true)
                },
                table: props.dataTable,
                resultPath: JsonPath.DISCARD
            })).next(runBenchmarkingForUsers))
                .otherwise(runBenchmarkingForUsers)))
                .otherwise(runBenchmarkingForUsers));

        // Full workflow step function definition
        const runBenchmarkOnlyChoice = new Choice(this, "Run Benchmark Only?", {
            comment: "Test if user wants to run benchmark only or full experiment"
        }).when(Condition.stringEquals("$.workloadConfig.settings.name", "RunBenchmarkOnly"), runBenchmarkingForUsers)
            .otherwise(experimentRunnerDefinition);

        // Define step function flow
        this.workflow = new StateMachine(this, 'Workflow', {
            definition: runBenchmarkOnlyChoice
        });
        props.key.grantDecrypt(this.workflow);

        let policy = new Policy(this, 'TaskStatusUpdatePolicy');
        policy.addStatements(
            new PolicyStatement({
                actions: ["states:SendTaskSuccess", "states:SendTaskFailure"],
                resources: ["*"]
            }));
        props.commonFunctions.createDestroyPlatform.role?.attachInlinePolicy(policy);
        props.commonFunctions.platformLambdaProxy.role?.attachInlinePolicy(policy);
    }
}