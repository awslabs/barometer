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

    cloudFormationClient = new CloudFormationClient({region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION});
    sfn = new SFN({region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION});

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
            let experiment = this.configuration.experiments[answers.experimentName].settings;
            experiment = JSON.parse(JSON.stringify(experiment)); // Make a copy of the object and operate on it further
            experiment.workloadConfig.settings.ddl = experiment.workloadConfig.settings.ddl[experiment.platformConfig.platformType];
            experiment.workloadConfig.settings.queries = experiment.workloadConfig.settings.queries[experiment.platformConfig.platformType];
            let stepFunctionArn;
            let dataBucketName;
            try {
                const commandOutput = await this.cloudFormationClient.send(new DescribeStacksCommand({StackName: "BenchmarkingStack"}));
                if (commandOutput.Stacks && commandOutput.Stacks[0].Outputs) {
                    for (let i = 0; i < commandOutput.Stacks[0].Outputs.length; i++) {
                        if (commandOutput.Stacks[0].Outputs[i].OutputKey == "ExperimentRunnerArn") {
                            stepFunctionArn = commandOutput.Stacks[0].Outputs[i].OutputValue;
                        }
                        if (commandOutput.Stacks[0].Outputs[i].OutputKey == "DataBucketName") {
                            dataBucketName = commandOutput.Stacks[0].Outputs[i].OutputValue;
                        }
                    }
                }
            } catch (e) {
                if (e.name == "ValidationError") {
                    // Stack doesn't exists
                    this.printInfo();
                }
            }

            if (stepFunctionArn && dataBucketName) {
                // Start step function execution
                const startExecutionCmd = new StartExecutionCommand({
                    stateMachineArn: stepFunctionArn,
                    input: JSON.stringify(experiment).replace(/#DATA_BUCKET#/g, dataBucketName)
                });
                const output = await this.sfn.send(startExecutionCmd);
                const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION;
                console.log("Experiment run started at - " + output.startDate + " in region - " + region);
                const executionUrl = "https://" + region + ".console.aws.amazon.com/states/home?region=" + region + "#/executions/details/" + output.executionArn;
                const dashboardUrl = "https://" + region + ".console.aws.amazon.com/cloudwatch/home?region=" + region + "#dashboards:name=BenchmarkingExperiment-"
                    + experiment.workloadConfig.settings.name.replace("/", "_") + "-"
                    + experiment.platformConfig.settings.name;
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
