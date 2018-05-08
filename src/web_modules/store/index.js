import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import { routerMiddleware } from "react-router-redux";
import "./checkModel";

const epicMiddleware = createEpicMiddleware(combineEpics(...window._newEpics));

function configureStore() {
  let store;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  store = createStore(
    combineReducers(window._newReduce),
    composeEnhancers(applyMiddleware(epicMiddleware, routerMiddleware(history)))
  );
  return store;
}

export const store = configureStore();
