import React, {Component} from 'react'
import {Button, Form} from "react-bootstrap";


interface StepExperimentProps {

}

interface StepExperimentState {
    executionMode: string;
    concurrentSessionCount: number;
    keepInfrastructure: boolean;
}

export default class StepExperiment extends Component<StepExperimentProps, StepExperimentState> {

    constructor(props: StepExperimentProps) {
        super(props);

        this.state = {
            concurrentSessionCount: 1,
            executionMode: "sequential",
            keepInfrastructure: false
        }
    }

    handleChange = (event: React.FormEvent) => {
        const target = event.target as HTMLInputElement
        let value: any = target.value;
        this.setState({
            ...this.state,
            [target.id as any]: value
        });
        console.log(this.state)
    }

    render() {
        return (
            <div className="step step3">
                <Form className="form-horizontal">
                    <Form.Group>
                        <Form.Label>
                            <h5>Step 3: Experiment Summary</h5>
                            <h6>Benchmarking tool UI Wizard will help you define your experiment</h6>
                        </Form.Label>
                    </Form.Group>
                    <Form.Group controlId="concurrentSessionCount">
                        <Form.Label>How many users will run query in parallel?</Form.Label>
                        <Form.Control required type="number" step={1} min={1} max={10}
                                      value={this.state.concurrentSessionCount} onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group controlId="executionMode">
                        <Form.Label>Do you want users to run query one by one or in parallel?</Form.Label>
                        <Form.Control value={this.state.executionMode} as="select" onChange={this.handleChange} custom>
                            <option value="sequential">Sequential</option>
                            <option value="concurrent">Concurrent</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="keepInfrastructure">
                        <Form.Check checked={this.state.keepInfrastructure} id="keepInfrastructure" type="switch"
                                    onChange={this.handleChange}
                                    label="Keep infrastructure after experiment run"/>
                    </Form.Group>
                    <Form.Group>
                        <Button className="btn btn-prev btn-amzn btn-lg">Run Experiment</Button>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}