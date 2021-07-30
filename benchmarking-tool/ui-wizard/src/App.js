import logo from './logo.svg';
import './App.css';
import React from 'react'
import StepZilla from "react-stepzilla";
import StepWorkload from './Components/stepWorkload'
import StepPlatform from './Components/stepPlatform'
import StepExperiment from './Components/stepExperiment'

const steps = [
    {name: 'Workload', component: <StepWorkload/>},
    {name: 'Platform', component: <StepPlatform/>},
    {name: 'Experiment Summary', component: <StepExperiment/>}
];

function App() {
    return (
        <div className="App">
            <header className="App-header">
            </header>
            <div className='step-progress'>
                <StepZilla steps={steps} />
            </div>
        </div>
    );
}

export default App;
