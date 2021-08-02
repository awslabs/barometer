import {Component} from "react";
import StepZilla from "react-stepzilla";
import StepExperiment from "./StepExperiment";
import StepPlatform from "./StepPlatform";
import StepWorkload from "./StepWorkload";


interface WizardProps {
}

interface WizardState {

}

const steps = [
    {name: 'Workload', component: <StepWorkload/>},
    {name: 'Platform', component: <StepPlatform/>},
    {name: 'Experiment', component: <StepExperiment/>}
];

export default class Wizard extends Component<WizardProps, WizardState> {
    render() {
        return (
            <div className='step-progress col-md-8'>
                <StepZilla steps={steps} nextButtonCls="btn btn-prev btn-amzn btn-lg pull-right"
                           backButtonCls="btn btn-prev btn-amzn btn-lg pull-right" onStepChange={this.updateState}/>
            </div>
        );
    }

    private updateState(step: any) {
        console.log(step);
    }
}