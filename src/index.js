import React from "react";
import ReactDOM from "react-dom";
import Routers from "./router";
import { Provider } from "react-redux";
import { store } from "store";

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Routers />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
