import React from 'react'

export default () => {
    return (
        <div className="step step1">
            <div className="row">
                <form id="Form" className="form-horizontal">
                    <div className="form-group">
                        <label className="col-md-12 control-label">
                            <h1>Step 1: Define Your Workload</h1>
                            <h3>Benchmarking tool UI Wizard will help you define your experiment</h3>
                        </label>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Name</label>
                                        <input type="input" className="form-control" id="name" required
                                               aria-describedby="nameHelp" placeholder={"My Workload 1"}/>
                                        <div id="nameHelp" className="form-text">
                                            Please provide name for this entry (You will be able to use by this name
                                            later)
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="dataset"
                                               className="form-label">Which Analytics / OLAP dataset would you like to
                                            use ?</label>
                                        <select className="form-select">
                                            <option selected>TPC-DS Version 3</option>
                                            <option>TPC-H Version 3</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="scale"
                                               className="form-label">Which scaling factor would you like to use
                                            ?</label>
                                        <select className="form-select">
                                            <option selected>10k</option>
                                            <option>100k</option>
                                        </select>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked"
                                               checked/>
                                        <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Partition
                                            the data whenever possible</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="flexRadioDefault"
                                               id="flexRadioDefault1"/>
                                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                                            Import data directly from the source bucket
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="flexRadioDefault"
                                               id="flexRadioDefault2" checked/>
                                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                                            Make a copy in a local S3 bucket first
                                        </label>
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