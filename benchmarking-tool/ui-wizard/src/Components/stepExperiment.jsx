import React from 'react'

export default () => {
    return (
        <div className="step step1">
            <div className="row">
                <form id="Form" className="form-horizontal">
                    <div className="form-group">
                        <label className="col-md-12 control-label">
                            <h1>Step 3: Experiment Summary</h1>
                            <h3>Benchmarking tool UI Wizard will help you define your experiment</h3>
                        </label>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">How many users will run query in
                                            parallel?</label>
                                        <input type="number" step={1} min={1} max={10} className="form-control" required
                                               aria-describedby="nameHelp" value={1}/>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">How many queries each user
                                            will run concurrently?</label>
                                        <input type="number" step={1} min={1} max={22} className="form-control" required
                                               aria-describedby="nameHelp" value={1}/>
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