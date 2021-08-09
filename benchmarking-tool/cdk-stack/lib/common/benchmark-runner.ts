import {Construct} from "@aws-cdk/core";
import {StateMachine} from "@aws-cdk/aws-stepfunctions";
import {LambdaInvoke} from "@aws-cdk/aws-stepfunctions-tasks";
import {CommonFunctions} from "./common-functions";


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

        const benchmarkRunnerDefinition = new LambdaInvoke(this, 'Run Benchmarking Query', {
            lambdaFunction: props.commonFunctions.jdbcQueryRunner
        });

        this.workflow = new StateMachine(this, 'Workflow', {
            definition: benchmarkRunnerDefinition
        });
    }
}