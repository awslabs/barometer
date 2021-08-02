import './App.css';
import React, {Component, Fragment} from "react";
import {Nav, Navbar, NavItem} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link, withRouter} from "react-router-dom";
import {Routes} from "./Routes";

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

    render() {
        return (
            <div className="App container">
                <Navbar collapseOnSelect>
                    <Navbar.Brand>
                        <Link to="/">
                            <span className="orange">Benchmarking Tool</span>
                        </Link>
                    </Navbar.Brand>
                    <Navbar.Toggle/>
                    <Navbar.Collapse>
                        <Nav>
                            <Fragment>
                                <LinkContainer to="/wizard">
                                    <NavItem><span className="orange line-height-24">Wizard</span></NavItem>
                                </LinkContainer>
                            </Fragment>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Routes/>
            </div>
        );
    }
}

export default withRouter(App as any);
