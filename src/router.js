import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import User from "./users/components";
import { ConnectedRouter } from "react-router-redux";
import createHistory from "history/createBrowserHistory";
import { connect } from "react-redux";

const history = createHistory();

class Routes extends React.Component {
  render() {
    return (
      <ConnectedRouter history={history}>
        <Switch>
          <Route
            path="/"
            render={() => {
              history.push({ pathname: "/user" });
              return null;
            }}
            exact
          />
          <Route path="/user" component={User} />
        </Switch>
      </ConnectedRouter>
    );
  }
}

export default Routes;
