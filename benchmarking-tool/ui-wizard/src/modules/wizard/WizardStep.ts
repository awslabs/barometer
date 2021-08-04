import React, {Component} from "react";

export interface StepInput<T> {
    state: T;
    updateState: CallableFunction;
    finishWizard?: CallableFunction;
}

export default class WizardStep<T> extends Component<StepInput<T>, T> {

    finishWizard = () => {
        if (this.props.finishWizard)
            this.props.finishWizard();
    }

    mapValue = (target: HTMLInputElement, value: any): any => {
        return value;
    }

    handleChange = (event: React.FormEvent) => {
        const target = event.target as HTMLInputElement
        let value: any = target.value;
        if (target.type === "number") value = parseInt(value);
        if (target.type === "checkbox") value = target.checked;
        value = this.mapValue(target, value);
        this.setState({
            ...this.state,
            [target.id as any]: value
        }, () => this.props.updateState(this.state));
        console.log(target);
    }
}