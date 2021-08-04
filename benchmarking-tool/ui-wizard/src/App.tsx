import './App.css';
import React, {Component, Fragment} from "react";
import {Nav, Navbar, NavItem} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link, withRouter} from "react-router-dom";
import {Routes} from "./Routes";
import {withAuthenticator} from '@aws-amplify/ui-react';
import Amplify, {Auth} from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

interface AppProps {
    history: any;
}

interface AppState {

}


class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        document.title = "Benchmarking Tool Home"
    }

    handleLogout = async () => {
        await Auth.signOut();
        window.location.reload();
    }

    render() {
        return (
            <div className="App container">
                <Navbar collapseOnSelect>
                    <Navbar.Brand>
                        <Link to="/">
                            <span className="orange">Benchmarking Tool</span>
                        </Link>
                    </Navbar.Brand>
                    <Nav>
                        <Fragment>
                            <LinkContainer to="/wizard">
                                <NavItem><span className="orange line-height-24">Wizard</span></NavItem>
                            </LinkContainer>
                        </Fragment>
                        <NavItem onClick={this.handleLogout}><span
                            className="orange line-height-24 ml-2">Log out</span></NavItem>
                    </Nav>
                </Navbar>
                <Routes/>
            </div>
        );
    }
}

export default withAuthenticator(withRouter(App as any));
