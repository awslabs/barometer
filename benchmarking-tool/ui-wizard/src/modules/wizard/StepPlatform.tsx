import React, {Component} from 'react'
import {Form} from "react-bootstrap";


interface StepPlatformProps {
}

interface StepPlatformState {

}

export default class StepPlatform extends Component<StepPlatformProps, StepPlatformState> {

    render() {
        return (
            <div className="step step2">
                <Form className="form-horizontal">
                    <Form.Group>
                        <Form.Label>
                            <h5>Step 2: Define Your Platform</h5>
                            <h6>Benchmarking tool UI Wizard will help you define your experiment</h6>
                        </Form.Label>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="input" required placeholder="My platform"/>
                            <Form.Text>
                                You will be able to use by this name later
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="platformType">
                            <Form.Label>Which platform would you like to configure?</Form.Label>
                            <Form.Control as="select" custom>
                                <option selected>Redshift</option>
                                <option>Athena</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="nodeType">
                            <Form.Label> Select the node type</Form.Label>
                            <Form.Control as="select">
                                <option selected>ra3.xplus</option>
                                <option>ra3.4xlarge</option>
                                <option>ra3.16xlarge</option>
                                <option>dc2.large</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="numberOfNodes">
                            <Form.Label htmlFor="nodes">Number of Nodes</Form.Label>
                            <Form.Control type="number" value="2"/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check type="switch" label="Workload manager(WLM)"/>
                            <Form.Check type="switch" label="Advanced Query Accelerator (AQUA)"/>
                            <Form.Check type="switch" label="Concurrency Scaling"/>
                            <Form.Check type="switch" label="Redshift Spectrum"/>
                        </Form.Group>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}