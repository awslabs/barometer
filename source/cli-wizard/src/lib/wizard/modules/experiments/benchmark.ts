import {CLIModule} from '../../common/cli-module';
import {Configuration} from '../../../impl/configuration';
import {InvocationType, Lambda} from "@aws-sdk/client-lambda";
import {CloudFormationClient, DescribeStacksCommand} from "@aws-sdk/client-cloudformation";
import {TextDecoder, TextEncoder} from "util";
import {SFN, StartExecutionCommand} from "@aws-sdk/client-sfn";
import open from "open";

export class Module {
    public static getInstance(configuration: Configuration): ExperimentModule {
        return new ExperimentModule(configuration, 'ExperimentModule');
    }
}

export class ExperimentModule extends CLIModule {

    cloudFormationClient = new CloudFormationClient({region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION});
    lambdaClient = new Lambda({region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION});
    queryRunnerFunctionArn: string | undefined;
    secretsManagerArnRegex = /arn:aws:secretsmanager:[a-z0-9-]+:[0-9]{12}:secret:[a-zA-Z0-9-]+/g
    sfn = new SFN({region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION});

    /**
     * Questions to be prompted
     */
    setQuestions(): void {
        this.questions = new Array<any>();
        this.questions.push({
            type: 'input',
            name: 'secretArn',
            message: 'Please provide AWS secrets manager SecretArn having database connection details',
            validate: async (input: string): Promise<any> => {
                let exceptionMessage = "Please make sure you have driver added to platforms/extra-drivers";
                if (!this.secretsManagerArnRegex.test(input))
                    return "Please provide valid  secrets manager secretARN";
                try {
                    const response = await this.lambdaClient.invoke({
                        FunctionName: this.queryRunnerFunctionArn,
                        InvocationType: InvocationType.RequestResponse,
                        Payload: new TextEncoder().encode(JSON.stringify({
                            connectionTest: "true",
                            sessionId: "ConnectionTest",
                            secretId: input
                        }))
                    });
                    const respPayload = JSON.parse(new TextDecoder().decode(response.Payload));
                    if (respPayload["errorMessage"])
                        exceptionMessage = respPayload["errorMessage"];
                    else
                        return true;
                } catch (e: any) {
                    exceptionMessage = e.message;
                }
                return exceptionMessage;
            },
        });
        this.questions.push({
            type: 'input',
            name: 'benchmarkingQueriesPath',
            message: 'Please provide s3 path of benchmarking queries folder'
        });
        this.questions.push({
            type: 'number',
            name: 'concurrentSessionCount',
            message: 'Number of concurrent sessions?',
            default: 1,
            validate: async (input: number): Promise<any> => {
                if (input > 0 && input < 1001) return true;
                return 'Only positive numbers > 0 and < 1001 are allowed';
            },
        });
    }

    async runModuleQuestions(): Promise<[string, Configuration]> {
        let stepFunctionArn;
        let dataBucketName;
        let metricsBucketName;
        let quickSightDashboardID; 
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
                    if (commandOutput.Stacks[0].Outputs[i].OutputKey == "QueryRunnerLambdaArn") {
                        this.queryRunnerFunctionArn = commandOutput.Stacks[0].Outputs[i].OutputValue;
                    }
                    if (commandOutput.Stacks[0].Outputs[i].OutputKey == "MetricsBucketName") {
                        metricsBucketName = commandOutput.Stacks[0].Outputs[i].OutputValue;
                    }
                    if (commandOutput.Stacks[0].Outputs[i].OutputKey == "QuickSightDashboardID") {
                        quickSightDashboardID = commandOutput.Stacks[0].Outputs[i].OutputValue;
                    } 
                }
            }
            console.log(commandOutput)
            // Ask questions as we know the lambda function name here.
            const _questions: Array<any> = this.getQuestions();
            await this.askQuestions(_questions).then(async (answers) => {
                const experiment = {
                    ddlScripts: {Payload: {paths: []}},
                    keepInfrastructure: true,
                    concurrentSessionCount: answers.concurrentSessionCount,
                    platformConfig: {
                        name: "CustomPlatform"
                    },
                    platformLambdaOutput: {secretIds: [answers.secretArn], stackName: "RunBenchmarkOnly"},
                    workloadConfig: {
                        settings: {
                            name: "RunBenchmarkOnly",
                            queries: {
                                path: answers.benchmarkingQueriesPath
                            }
                        }
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
                    // const dashboardUrl = "https://" + grafanaDashBoardURL + "/d/barometer1/Barometer?orgId=1&from=now-1h&to=now";
                    // const adminPasswordUrl="https://" + region + ".console.aws.amazon.com/secretsmanager/secret?region=" + region + "&name=" + grafanaAdminPasswordArn; 
                    console.log(line);
                    console.log("VIZUALISATION");
                    console.log("When the execution is finished : ");
                    console.log("1) Set the query result location of Athena if it is not yet already done. For support, see the paragraph 'Specifying a query result location using the Athena console' from the online documentation : https://docs.aws.amazon.com/athena/latest/ug/querying.html#query-results-specify-location-console");
                    console.log("2) Create a QuickSight user account (see the online documentation : https://docs.aws.amazon.com/quicksight/latest/user/signing-in.html");
                    console.log("3) Add your QuickSight user account to the barometer QuickSight group (https://" + process.env.CDK_DEFAULT_REGION + ".quicksight.aws.amazon.com/sn/console/groups). For support, see the paragraph 'To add a user to a group' from the online documentation : https://docs.aws.amazon.com/quicksight/latest/user/creating-quicksight-groups.html");
                    console.log("4) Grant access to the S3 bucket named " + metricsBucketName  + " for QuickSight (https://" + process.env.CDK_DEFAULT_REGION + ".quicksight.aws.amazon.com/sn/console/resources). For support, see the paragraph 'To authorize Amazon QuickSight to access your Amazon S3 bucket' from the online documentation : https://docs.aws.amazon.com/quicksight/latest/user/troubleshoot-connect-S3.html");
                    console.log("5) Open the QuickSight report for the barometer : https://eu-west-1.quicksight.aws.amazon.com/sn/dashboards/" + quickSightDashboardID);                  
                    console.log(line);
                            //await open(executionUrl);
                } else this.printInfo();
            });
        } catch (e: any) {
            if (e.name == "ValidationError") {
                // Stack doesn't exists
                this.printInfo();
            } else {
                console.log("==> " + e.message);
                this.printInfo();
            }
        }


        this.nextstep = 'exit-module';
        return [this.nextstep, this.configuration];
    }

    printInfo(): void {
        console.log("*************** ERROR ********************")
        console.log("Benchmarking stack doesn't exist OR environment variables not set (missing access).. Please deploy it first using following command");
        console.log("cd ../cdk-stack && ./deploy.sh");
        console.log("******************************************")
    }
}
