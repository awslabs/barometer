import React, {Component} from 'react'
import {Form} from "react-bootstrap";

interface StepWorkloadProps {
}

interface StepWorkloadState {
    name: string;
    dataset: string;
    loadMethod: string;
    usePartitioning: boolean;
    scalingFactor: number;
}

export default class StepWorkload extends Component<StepWorkloadProps, StepWorkloadState> {

    constructor(props: StepWorkloadProps) {
        super(props);

        this.state = {
            name: "My workload",
            dataset: "tpc-ds/v3",
            loadMethod: "copy",
            usePartitioning: true,
            scalingFactor: 10000
        }
    }

    handleChange = (event: React.FormEvent) => {
        const target = event.target as HTMLInputElement
        let value: any = target.value;
        if (target.id === "usePartitioning")
            value = value === "on"
        if (target.id === "scalingFactor")
            value = parseInt(value)
        this.setState({
            ...this.state,
            [target.id as any]: value
        });
        console.log(this.state)
    }

    render() {
        return (
            <div className="step step1">
                <Form className="form-horizontal">
                    <Form.Group controlId="defineWorkload">
                        <Form.Label>
                            <h5>Step 1: Define Your Workload</h5>
                            <h6>Benchmarking tool UI Wizard will help you define your experiment</h6>
                        </Form.Label>
                    </Form.Group>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="input" value={this.state.name} onChange={this.handleChange}
                                      placeholder="My workload"/>
                        <Form.Text>
                            You will be able to use by this name later
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="dataset">
                        <Form.Label>Which Analytics / OLAP dataset would you like to use?</Form.Label>
                        <Form.Control value={this.state.dataset} as="select" onChange={this.handleChange} custom>
                            <option value="tpc-ds/v3">TPC-DS Version 3</option>
                            <option value="tpc-h/v3">TPC-H Version 3</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="scalingFactor">
                        <Form.Label>Which scaling factor would you like to use?</Form.Label>
                        <Form.Control value={this.state.scalingFactor} as="select" onChange={this.handleChange} custom>
                            <option value="10000">10k</option>
                            <option value="100000">100k</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="usePartitioning">
                        <Form.Check checked={this.state.usePartitioning} id="usePartitioning" type="switch"
                                    onChange={this.handleChange}
                                    label="Partition the data whenever possible"/>
                    </Form.Group>
                    <Form.Group controlId="loadMethod">
                        <Form.Label>Which load method do you want to use?</Form.Label>
                        <Form.Control value={this.state.loadMethod} as="select" onChange={this.handleChange} custom>
                            <option value="direct">Import data directly from the source bucket</option>
                            <option value="copy">Make a copy in a local S3 bucket first</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}