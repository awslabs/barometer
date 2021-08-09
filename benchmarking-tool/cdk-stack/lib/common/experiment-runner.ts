import {Construct} from "@aws-cdk/core";
import {CommonFunctions} from "./common-functions";
import {LambdaInvoke, StepFunctionsStartExecution} from "@aws-cdk/aws-stepfunctions-tasks";
import {JsonPath, Map, StateMachine} from "@aws-cdk/aws-stepfunctions";
import {TaskInput} from "@aws-cdk/aws-stepfunctions/lib/input";


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

        const experimentRunnerDefinition = new LambdaInvoke(this, 'CreatePlatform', {
            lambdaFunction: props.commonFunctions.createDestroyPlatform,
            payload: TaskInput.fromJsonPathAt("$.platformConfig"), // pass platform config from state input to lambda
            comment: "Create new platform based on input from caller CLI/UI",
            outputPath: "$.platformLambdaOutput"
        }).next(new LambdaInvoke(this, 'RunDDLs', {
            lambdaFunction: props.commonFunctions.jdbcQueryRunner,
            payload: TaskInput.fromJsonPathAt("$.workloadConfig"), // pass workload config from state input to lambda
            comment: "Run all DDLs on platform",
            resultPath: JsonPath.DISCARD,
        })).next(new LambdaInvoke(this, 'Copy dataset if required', {
            lambdaFunction: props.commonFunctions.dataCopier,
            comment: "Copy dataset from workload config path to the platform",
            resultPath: JsonPath.DISCARD,
        })).next(new LambdaInvoke(this, 'Get users times session items', {
            lambdaFunction: props.commonFunctions.stepFunctionHelpers,
            payload: TaskInput.fromObject({
                "method": "usersTimesItems",
                "parameters": {
                    "concurrentSessionCount.$": "$.concurrentSessionCount",
                    "platform.$": "$.platformLambdaOutput"
                }
            }),
            comment: "Prepare Map items for users defined in platform times user sessions defined in experiment",
            resultPath: "$.userSessions",
        })).next(new Map(this, 'User sessions', {
            maxConcurrency: 2, // TODO: Find a way to pass this dynamically based on $.concurrentSessionCount
            resultPath: JsonPath.DISCARD,
            itemsPath: "$.userSessions"
        }).iterator(new StepFunctionsStartExecution(this, 'Run Benchmarking', {
            stateMachine: props.benchmarkRunnerWorkflow
        })));

        // Define step function flow
        this.workflow = new StateMachine(this, 'Workflow', {
            definition: experimentRunnerDefinition
        });
    }
}