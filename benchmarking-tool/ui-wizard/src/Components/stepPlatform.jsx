import React from 'react'

export default () => {
    return (
        <div className="step step1">
            <div className="row">
                <form id="Form" className="form-horizontal">
                    <div className="form-group">
                        <label className="col-md-12 control-label">
                            <h1>Step 2: Define Your Platform</h1>
                            <h3>Benchmarking tool UI Wizard will help you define your experiment</h3>
                        </label>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Name</label>
                                        <input type="input" className="form-control" id="name" required
                                               aria-describedby="nameHelp" placeholder={"My Platform 1"}/>
                                        <div id="nameHelp" className="form-text">
                                            Please provide name for this entry (You will be able to use by this name
                                            later)
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="dataset"
                                               className="form-label"> Which platform would you like to
                                            configure?</label>
                                        <select className="form-select">
                                            <option selected>Redshift</option>
                                            <option>Athena</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="nodeType"
                                               className="form-label"> Select the node type</label>
                                        <select className="form-select">
                                            <option selected>ra3.xplus</option>
                                            <option selected>ra3.4xlarge</option>
                                            <option selected>ra3.16xlarge</option>
                                            <option selected>dc2.large</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="nodes" className="form-label">Number of Nodes</label>
                                        <input type="number" className="form-control" id="nodes" value="2"/>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="f1"/>
                                        <label className="form-check-label" htmlFor="f1">Workload manager (WLM)</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="f2"/>
                                        <label className="form-check-label" htmlFor="f1">Advanced Query Accelerator
                                            (AQUA)</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="f3"/>
                                        <label className="form-check-label" htmlFor="f1">Concurrency Scaling</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="f4"/>
                                        <label className="form-check-label" htmlFor="f1">Redshift Spectrum</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}