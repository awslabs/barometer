import {CLIModule} from '../../common/cli-module';
import {Configuration} from '../../../impl/configuration';
import {CloudFormationClient, DescribeStacksCommand} from "@aws-sdk/client-cloudformation";
import {SFN, StartExecutionCommand} from "@aws-sdk/client-sfn";

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
            //console.log(JSON.stringify(experiment));
            //console.log(JSON.stringify(answers));
            experiment = JSON.parse(JSON.stringify(experiment)); // Make a copy of the object and operate on it further
            experiment.workloadConfig.settings.ddl = experiment.workloadConfig.settings.ddl[experiment.platformConfig.platformType];
            experiment.workloadConfig.settings.queries = experiment.workloadConfig.settings.queries[experiment.platformConfig.platformType];
            let stepFunctionArn;
            let dataBucketName;
            let metricsBucketName;
            let quickSightDashboardID;
            try {
                const commandOutput = await this.cloudFormationClient.send(new DescribeStacksCommand({StackName: "BenchmarkingStack"}));
                if (commandOutput.Stacks && commandOutput.Stacks[0].Outputs) {
                    for (let i = 0; i < commandOutput.Stacks[0].Outputs.length; i++) {
                        console.log(commandOutput.Stacks[0].Outputs[i].OutputKey);
                        if (commandOutput.Stacks[0].Outputs[i].OutputKey == "ExperimentRunnerArn") {
                            stepFunctionArn = commandOutput.Stacks[0].Outputs[i].OutputValue;
                        }
                        if (commandOutput.Stacks[0].Outputs[i].OutputKey == "DataBucketName") {
                            dataBucketName = commandOutput.Stacks[0].Outputs[i].OutputValue;
                        }
                        if (commandOutput.Stacks[0].Outputs[i].OutputKey == "MetricsBucketName") {
                            metricsBucketName = commandOutput.Stacks[0].Outputs[i].OutputValue;
                        }
                        if (commandOutput.Stacks[0].Outputs[i].OutputKey == "QuickSightDashboardID") {
                            quickSightDashboardID = commandOutput.Stacks[0].Outputs[i].OutputValue;
                        }
                    }

                }
            } catch (e: any) {
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
                const line = '-'.repeat(process.stdout.columns);
                console.log(line);
                console.log("EXECUTION");
                console.log("Experiment run started at - " + output.startDate + " in region - " + region);
                const executionUrl = "https://" + region + ".console.aws.amazon.com/states/home?region=" + region + "#/executions/details/" + output.executionArn;
                console.log("Visit this link to see the execution: " + executionUrl);
                //const dashboardUrl = "https://" + grafanaDashBoardURL + "/d/barometer1/Barometer?orgId=1&from=now-1h&to=now&var-STACK_NAME=" + experiment.platformConfig.platformType +  "-" + experiment.platformConfig.name;//"https://" + region + ".console.aws.amazon.com/cloudwatch/home?region=" + region + "#dashboards:name=BenchmarkingExperiment-"
                //const adminPasswordUrl="https://" + region + ".console.aws.amazon.com/secretsmanager/secret?region=" + region + "&name=" + grafanaAdminPasswordArn; 
                console.log(line);
                console.log("VIZUALISATION");
                console.log("When the execution is finished : ");
                console.log("1) Set the query result location of Athena if it is not yet already done. For support, see the paragraph 'Specifying a query result location using the Athena console' from the online documentation : https://docs.aws.amazon.com/athena/latest/ug/querying.html#query-results-specify-location-console");
                console.log("2) Activate the user-defined tags 'PlatformStackName' & 'ManagedBy' in the billing console. For support, see the online documentation : https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/activating-tags.html");
                console.log("3) Create a QuickSight user account (see the online documentation : https://docs.aws.amazon.com/quicksight/latest/user/signing-in.html");
                console.log("4) Add your QuickSight user account to the barometer QuickSight group (https://" + region + ".quicksight.aws.amazon.com/sn/console/groups). For support, see the paragraph 'To add a user to a group' from the online documentation : https://docs.aws.amazon.com/quicksight/latest/user/creating-quicksight-groups.html");
                console.log("5) Grant access to the S3 bucket named " + metricsBucketName + " for QuickSight (https://" + region + ".quicksight.aws.amazon.com/sn/console/resources). For support, see the paragraph 'To authorize Amazon QuickSight to access your Amazon S3 bucket' from the online documentation : https://docs.aws.amazon.com/quicksight/latest/user/troubleshoot-connect-S3.html");
                console.log("6) Open the QuickSight report for the barometer : https://" + region + ".quicksight.aws.amazon.com/sn/dashboards/" + quickSightDashboardID);
                console.log("Note : up to 24 hours are needed to get the daily cost.");
                console.log(line);
                //console.log("Visit this link to see the dashboard: " + dashboardUrl);
                //await open(executionUrl);
            } else this.printInfo();

            return answers;
        });

        this.nextstep = 'exit';
        return [this.nextstep, this.configuration];
    }

    printInfo(): void {
        console.log("*************** ERROR ********************")
        console.log("Benchmarking stack doesn't exist OR environment variables not set (missing access).. Please deploy it first using following command");
        console.log("cd ../cdk-stack && ./deploy.sh");
        console.log("******************************************")
    }
}
