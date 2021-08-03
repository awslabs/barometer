import {Component} from "react";
import StepZilla from "react-stepzilla";
import StepExperiment, {StepExperimentState} from "./StepExperiment";
import StepPlatform, {StepPlatformState} from "./StepPlatform";
import StepWorkload, {StepWorkloadState} from "./StepWorkload";

interface WizardProps {

}

interface WizardState {
    workloadState: StepWorkloadState;
    platformState: StepPlatformState;
    experimentState: StepExperimentState;
}

export default class Wizard extends Component<WizardProps, WizardState> {

    constructor(props: WizardState) {
        super(props);
        this.state = {
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
        console.log(this.state);
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
                <StepZilla steps={steps} nextButtonCls="btn btn-prev btn-amzn btn-lg pull-right"
                           backButtonCls="btn btn-prev btn-amzn btn-lg pull-right"/>
            </div>
        );
    }
}