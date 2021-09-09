import {CLIModule} from '../../common/cli-module';
import {Configuration} from '../../../impl/configuration';
import {CloudFormationClient, DescribeStacksCommand} from "@aws-sdk/client-cloudformation";
import {SFN, StartExecutionCommand} from "@aws-sdk/client-sfn";
import open from "open";

export class Module {
    public static getInstance(configuration: Configuration): ExperimentModule {
        return new ExperimentModule(configuration, 'ExperimentModule');
    }
}

export class ExperimentModule extends CLIModule {

    cloudFormationClient = new CloudFormationClient({});
    sfn = new SFN({});

    /**
     * Questions to be prompted
     */
    setQuestions(): void {
        this.questions = new Array<any>();
        this.questions.push({
            type: 'list',
            name: 'experimentName',
            message: 'Please select experiment to run.'
        });
    }

    async runModuleQuestions(): Promise<[string, Configuration]> {
        const _questions: Array<any> = this.getQuestions();
        const experimentNamePrompt = this.getQuestionByName(_questions, 'experimentName');
        experimentNamePrompt['choices'] = async (): Promise<Array<any>> => {
            const choices: Array<any> = [];
            for (const _key in this.configuration.experiments) {
                choices.push({
                    name: this.configuration.experiments[_key].name,
                    value: _key,
                });
            }
            if (choices.length === 0) {
                choices.push({name: 'No entries found.', disabled: true});
                choices.push(this.getQuestionSeparator());
                choices.push({name: 'Return to the previous menu', value: 'exit-module'});
            }
            return choices;
        };
        await this.askQuestions(_questions).then(async (answers) => {
            const experiment = this.configuration.experiments[answers.experimentName].settings;
            let stepFunctionArn;
            try {
                const commandOutput = await this.cloudFormationClient.send(new DescribeStacksCommand({StackName: "BenchmarkingStack"}));
                if (commandOutput.Stacks && commandOutput.Stacks[0].Outputs) {
                    for (let i = 0; i < commandOutput.Stacks[0].Outputs.length; i++) {
                        if (commandOutput.Stacks[0].Outputs[i].OutputKey == "ExperimentRunnerArn") {
                            stepFunctionArn = commandOutput.Stacks[0].Outputs[i].OutputValue;
                        }
                    }
                }
            } catch (e) {
                if (e.name == "ValidationError") {
                    // Stack doesn't exists
                    this.printInfo();
                }
            }

            if (stepFunctionArn) {
                // Start step function execution
                const startExecutionCmd = new StartExecutionCommand({
                    stateMachineArn: stepFunctionArn,
                    input: JSON.stringify(experiment)
                });
                const output = await this.sfn.send(startExecutionCmd);
                console.log("Experiment run started at - " + output.startDate);
                const executionUrl = "https://console.aws.amazon.com/states/home#/executions/details/" + output.executionArn;
                const dashboardUrl = "https://console.aws.amazon.com/cloudwatch/home#dashboards:name=BenchmarkingExperiment-"
                    + experiment.workloadConfig.settings.name.replace("/", "_") + "-"
                    + experiment.platformConfig.platformType;
                console.log("Visit this link to see execution: " + executionUrl);
                console.log("Visit this link to see dashboard: " + dashboardUrl);
                await open(executionUrl);
            } else this.printInfo();

            return answers;
        });

        this.nextstep = 'exit';
        return [this.nextstep, this.configuration];
    }

    printInfo(): void {
        console.log("Benchmarking stack doesn't exist.. Please deploy it first using following command");
        console.log("cd ../cdk-stack && ./deploy.sh");
    }
}
