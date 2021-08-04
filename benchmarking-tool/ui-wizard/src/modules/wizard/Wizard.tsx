import {Component} from "react";
import StepZilla from "react-stepzilla";
import StepExperiment, {StepExperimentState} from "./StepExperiment";
import StepPlatform, {StepPlatformState} from "./StepPlatform";
import StepWorkload, {StepWorkloadState} from "./StepWorkload";
import {API, graphqlOperation} from "aws-amplify";
import {createExperiment, createPlatform, createWorkload} from "../../graphql/mutations";
import {GraphQLResult} from '@aws-amplify/api-graphql';
import {CreatePlatformMutation, CreateWorkloadMutation} from "../../API";
import {Alert} from "react-bootstrap";

interface WizardProps {

}

interface WizardState {
    showSuccessAlert: Boolean;
    workloadState: StepWorkloadState;
    platformState: StepPlatformState;
    experimentState: StepExperimentState;
}

export default class Wizard extends Component<WizardProps, WizardState> {

    constructor(props: WizardState) {
        super(props);
        this.state = {
            showSuccessAlert: false,
            workloadState: {
                name: "My workload",
                dataset: "tpc-ds/v3",
                loadMethod: "copy",
                usePartitioning: true,
                scalingFactor: 10000
            },
            platformState: {
                name: "My platform",
                platformType: "Redshift",
                nodeType: "ra3.xplus",
                numberOfNodes: 2,
                workloadManager: false,
                concurrencyScaling: false,
                aqua: false,
                spectrum: false,
                enforceWorkgroupConfiguration: false,
                bytesScannedCutoffPerQuery: 20 * 1000000
            },
            experimentState: {
                concurrentSessionCount: 1,
                executionMode: "sequential",
                keepInfrastructure: false
            }
        }
    }

    finishWizard = () => {
        const mainAPICalls: Array<Promise<GraphQLResult>> = [];
        mainAPICalls.push(API.graphql(graphqlOperation(createPlatform, {input: this.state.platformState})) as Promise<GraphQLResult>);
        mainAPICalls.push(API.graphql(graphqlOperation(createWorkload, {input: this.state.workloadState})) as Promise<GraphQLResult>);
        Promise.all(mainAPICalls)
            .then((results) => {
                let promise = API.graphql(graphqlOperation(createExperiment, {
                    input: {
                        concurrentSessionCount: this.state.experimentState.concurrentSessionCount,
                        executionMode: this.state.experimentState.executionMode,
                        keepInfrastructure: this.state.experimentState.keepInfrastructure,
                        experimentPlatformId: (results[0].data as CreatePlatformMutation).createPlatform?.id,
                        experimentWorkloadId: (results[1].data as CreateWorkloadMutation).createWorkload?.id
                    }
                })) as Promise<GraphQLResult>;
                promise.then(() => {
                    this.setState({...this.state, showSuccessAlert: true});
                });
            });
    }

    render() {
        const steps = [
            {
                name: 'Workload',
                component: <StepWorkload state={this.state.workloadState}
                                         updateState={(s: StepWorkloadState) => this.setState({
                                             ...this.state,
                                             workloadState: s
                                         })}/>
            },
            {
                name: 'Platform',
                component: <StepPlatform state={this.state.platformState}
                                         updateState={(s: StepPlatformState) => this.setState({
                                             ...this.state,
                                             platformState: s
                                         })}/>
            },
            {
                name: 'Experiment',
                component: <StepExperiment state={this.state.experimentState}
                                           updateState={(s: StepExperimentState) => this.setState({
                                               ...this.state,
                                               experimentState: s
                                           })}
                                           finishWizard={() => this.finishWizard()}/>
            }
        ];
        return (
            <div className='step-progress col-md-8'>
                {this.state.showSuccessAlert ?
                    <Alert variant="success" onClose={() => this.setState({...this.state, showSuccessAlert: false})}
                           dismissible>
                        Your experiment saved successfully.
                    </Alert> : ""}
                <StepZilla steps={steps} nextButtonCls="btn btn-prev btn-amzn btn-lg pull-right"
                           backButtonCls="btn btn-prev btn-amzn btn-lg pull-right"/>
            </div>
        );
    }
}