import {Construct} from "@aws-cdk/core";
import {JsonPath, Map, StateMachine} from "@aws-cdk/aws-stepfunctions";
import {LambdaInvoke} from "@aws-cdk/aws-stepfunctions-tasks";
import {CommonFunctions} from "./common-functions";
import {TaskInput} from "@aws-cdk/aws-stepfunctions/lib/input";


interface BenchmarkRunnerProps {
    commonFunctions: CommonFunctions;
}

/**
 * Defines benchmark runner workflow
 */
export class BenchmarkRunner extends Construct {

    public readonly workflow: StateMachine;

    constructor(scope: Construct, id: string, props: BenchmarkRunnerProps) {
        super(scope, id);

        const benchmarkRunnerDefinition = new LambdaInvoke(this, 'Fetch benchmarking SQL scripts S3 paths', {
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
        }).next(new Map(this, 'Run all queries', {
            comment: "Runs all benchmarking queries",
            itemsPath: "$.queries.Payload.paths",
            maxConcurrency: 1, // TODO set 1 to run one by one, 0 to run all at a time
            parameters: {
                "secretId.$": "$.secretId",
                "sessionId.$": "$.sessionId",
                "scriptPath.$": "$$.Map.Item.Value"
            },
            resultPath: JsonPath.DISCARD
        }).iterator(new LambdaInvoke(this, 'Run benchmarking query', {
            lambdaFunction: props.commonFunctions.jdbcQueryRunner,
            payload: TaskInput.fromObject({
                "secretId.$": "$.secretId",
                "sessionId.$": "$.sessionId",
                "scriptPath.$": "$.scriptPath"
            }),
            comment: "Run benchmarking query on platform",
            resultPath: JsonPath.DISCARD,
        })))

        this.workflow = new StateMachine(this, 'Workflow', {
            definition: benchmarkRunnerDefinition
        });
    }
}