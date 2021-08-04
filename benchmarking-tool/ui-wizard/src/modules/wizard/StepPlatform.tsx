import React from 'react'
import {Form} from "react-bootstrap";
import WizardStep, {StepInput} from "./WizardStep";


export interface StepPlatformState {
    // Common
    name: string;
    platformType: string;
    // Redshift properties
    nodeType: string;
    numberOfNodes: number;
    workloadManager: boolean;
    concurrencyScaling: boolean;
    aqua: boolean;
    spectrum: boolean;
    // Athena propoerties
    enforceWorkgroupConfiguration: boolean;
    bytesScannedCutoffPerQuery: number;
}

export default class StepPlatform extends WizardStep<StepPlatformState> {

    constructor(props: StepInput<StepPlatformState>) {
        super(props);
        this.state = props.state;
    }

    mapValue = (target: HTMLInputElement, value: any) => {
        if (target.id === "bytesScannedCutoffPerQuery")
            return value * 1000000;
        return value;
    };

    render() {
        return (
            <div className="step step2">
                <Form className="form-horizontal">
                    <Form.Group>
                        <Form.Label>
                            <h5>Step 2: Define Your Platform</h5>
                            <h6>Benchmarking tool UI Wizard will help you define your experiment</h6>
                        </Form.Label>
                    </Form.Group>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="input" required placeholder="My platform" value={this.state.name}
                                      onChange={this.handleChange}/>
                        <Form.Text>
                            You will be able to use by this name later
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="platformType">
                        <Form.Label>Which platform would you like to configure?</Form.Label>
                        <Form.Control as="select" custom value={this.state.platformType}
                                      onChange={this.handleChange}>
                            <option>Redshift</option>
                            <option>Athena</option>
                        </Form.Control>
                    </Form.Group>
                    {this.state.platformType === "Redshift" ?
                        <div>
                            <Form.Group controlId="nodeType">
                                <Form.Label>Select the node type</Form.Label>
                                <Form.Control as="select" value={this.state.nodeType}
                                              onChange={this.handleChange}>
                                    <option>ra3.xplus</option>
                                    <option>ra3.4xlarge</option>
                                    <option>ra3.16xlarge</option>
                                    <option>dc2.large</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="numberOfNodes">
                                <Form.Label>Number of Nodes</Form.Label>
                                <Form.Control type="number" value={this.state.numberOfNodes}
                                              onChange={this.handleChange}/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Check id="workloadManager" checked={this.state.workloadManager} onChange={this.handleChange}
                                            type="switch"
                                            label="Workload manager(WLM)"/>
                                <Form.Check id="aqua" checked={this.state.aqua} onChange={this.handleChange}
                                            type="switch"
                                            label="Advanced Query Accelerator (AQUA)"/>
                                <Form.Check id="concurrencyScaling" checked={this.state.concurrencyScaling} onChange={this.handleChange}
                                            type="switch"
                                            label="Concurrency Scaling"/>
                                <Form.Check id="spectrum" checked={this.state.spectrum} onChange={this.handleChange}
                                            type="switch"
                                            label="Redshift Spectrum"/>
                            </Form.Group>
                        </div>
                        : <div>
                            <Form.Group controlId="enforceWorkgroupConfiguration">
                                <Form.Check checked={this.state.enforceWorkgroupConfiguration}
                                            onChange={this.handleChange}
                                            type="switch"
                                            label="Enforce Workgroup Configuration"/>
                            </Form.Group>
                            <Form.Group controlId="bytesScannedCutoffPerQuery">
                                <Form.Label>Bytes Scanned Cutoff Per Query in MBs</Form.Label>
                                <Form.Control type="number" value={this.state.bytesScannedCutoffPerQuery / 1000000}
                                              onChange={this.handleChange}/>
                            </Form.Group>
                        </div>}
                </Form>
            </div>
        )
    }
}