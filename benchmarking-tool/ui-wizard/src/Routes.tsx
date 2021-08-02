import React from "react";
import {Route, Switch} from "react-router-dom";
import Wizard from "./modules/wizard/Wizard";

interface RouteProps {

}

export const Routes: React.SFC<RouteProps> = (childProps) =>
    <Switch>
        <Route path="/wizard" exact component={Wizard}/>
    </Switch>;