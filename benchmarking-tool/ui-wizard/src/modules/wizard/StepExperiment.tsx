import React, {Component} from 'react'
import {Form} from "react-bootstrap";


interface StepExperimentProps {

}

interface StepExperimentState {

}

export default class StepExperiment extends Component<StepExperimentProps, StepExperimentState> {

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
                    <Form.Group controlId="numberOfQueries">
                        <Form.Label>How many users will run query in parallel?</Form.Label>
                        <Form.Control required type="number" step={1} min={1} max={10} value={1}/>
                    </Form.Group>
                    <Form.Group controlId="numberOfUsers">
                        <Form.Label>How many queries each user will run concurrently?</Form.Label>
                        <Form.Control required type="number" step={1} min={1} max={22} value={1}/>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}