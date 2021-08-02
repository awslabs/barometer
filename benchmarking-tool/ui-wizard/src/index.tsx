import ReactDOM from 'react-dom';
import React from 'react';
import './index.css';
import App from './App';
import {BrowserRouter as Router} from "react-router-dom";
import registerServiceWorker from './registerServiceWorker';
import Amplify from "aws-amplify";
import 'bootstrap/dist/css/bootstrap.min.css';

Amplify.configure({});

ReactDOM.render(
    <Router>
        <App/>
    </Router>,
    document.getElementById('root')
);
registerServiceWorker();
