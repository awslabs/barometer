import React, {Component} from 'react'
import {Form} from "react-bootstrap";

interface StepWorkloadProps {
}

interface StepWorkloadState {

}

export default class StepWorkload extends Component<StepWorkloadProps, StepWorkloadState> {
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
                        <Form.Control type="input" required placeholder="My workload"/>
                        <Form.Text>
                            You will be able to use by this name later
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="dataset">
                        <Form.Label>Which Analytics / OLAP dataset would you like to use?</Form.Label>
                        <Form.Control as="select" custom>
                            <option selected>TPC-DS Version 3</option>
                            <option>TPC-H Version 3</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="scalingFactor">
                        <Form.Label>Which scaling factor would you like to use?</Form.Label>
                        <Form.Control as="select" custom>
                            <option selected>10k</option>
                            <option>100k</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="usePartitioning">
                        <Form.Check checked type="switch" label="Partition the data whenever possible"/>
                    </Form.Group>
                    <Form.Group controlId="loadMethod">
                        <Form.Label>Which load method do you want to use?</Form.Label>
                        <Form.Control as="select" custom>
                            <option selected>Import data directly from the source bucket</option>
                            <option>Make a copy in a local S3 bucket first</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}