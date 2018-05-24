import invariant from "invariant";
import isPlainObject from "is-plain-object";
import prefixNamespace from "./prefixNamespace";
import { isArray, isFunction } from "../utils";
import { NAMESPACE_SEP } from "../constants";
import { combineEpics } from "redux-observable";
/**
 * 封装redux
 * @author Vam
 * @date 2018-5-06
 */

/**
 * 检查model里面的格式
 */
function checkModel(model, existModels) {
  const { namespace, reducers, epics, actions } = model;

  // namespace 必须被定义
  invariant(namespace, `[app.model] namespace should be defined`);
  // 并且是字符串
  invariant(
    typeof namespace === "string",
    `[app.model] namespace should be string, but got ${typeof namespace}`
  );
  // 并且唯一
  invariant(
    !existModels.some(model => model.namespace === namespace),
    `[app.model] namespace should be unique`
  );

  // state 可以为任意值

  // reducers 可以为空，PlainObject
  if (reducers) {
    invariant(
      isPlainObject(reducers),
      `[app.model] reducers should be plain object, but got ${typeof reducers}`
    );
  }

  // actions 可以为空，PlainObject
  if (actions) {
    invariant(
      isPlainObject(actions),
      `[app.model] actions should be plain object, but got ${typeof actions}`
    );
  }

  // epics 可以为空，PlainObject
  if (epics) {
    invariant(
      isPlainObject(epics),
      `[app.model] epics should be plain object, but got ${typeof epics}`
    );
  }
}

/**
 * 初始化数据
 */
function init() {
  const app = {
    _models: [] //已存在的
  };
  return app;
}

const app = init();

/**
 * 检验model定义是否符合要求
 * @param {*} m
 */
function model(m) {
  if (process.env.NODE_ENV !== "production") {
    checkModel(m, app._models);
  }
  const prefixedModel = prefixNamespace(m);
  app._models.push(prefixedModel);
  return prefixedModel;
}

/**
 * 表示是一个方法
 * @param {any} value
 * @returns
 */
function identify(value) {
  return value;
}

/**
 * 处理单个reducer,匹配对应type的内容，即替代原来的switch...case...
 * @param {any} actionType
 * @param {any} [reducer=identify] 方法
 * @returns state
 */
function handleReducer(actionType, reducer = identify) {
  return (state, action) => {
    const { type } = action;
    invariant(type, "dispatch: action should be a plain Object with type");
    if (actionType === type) {
      return reducer(state, action);
    }
    return state;
  };
}

/**
 * 合并handleReducer返回的内容
 * @param {any} reducers 数组
 * @returns
 */
function reduceReducers(...reducers) {
  return (previous, current) =>
    reducers.reduce((p, r) => r(p, current), previous);
}

/**
 * 处理reducers
 * @param {any} reducers
 * @param {any} defaultState 初始state
 * @returns 方法(state = defaultState, action)=>{}
 */
function handleReducers(reducers, defaultState) {
  const newReducers = Object.keys(reducers).map(type =>
    handleReducer(type, reducers[type])
  );
  const reducer = reduceReducers(...newReducers);
  return (state = defaultState, action) => reducer(state, action);
}

/**
 * reducer的数组和对象形式的处理
 * @param {any} reducers
 * @param {any} state
 * @param {any} handleActions
 * @returns
 */
function getReducer(reducers, state, handleActions) {
  if (Array.isArray(reducers)) {
    return reducers[1](
      (handleActions || defaultHandleActions)(reducers[0], state)
    );
  } else {
    return (handleActions || defaultHandleActions)(reducers || {}, state);
  }
}

/**
 * epic的数组和对象形式的处理
 * @param {any} model
 * @param {any} handleAction
 * @returns
 */
function getEpic(model, handleAction) {
  if (Array.isArray(model.epics)) {
    return model.epics[1](
      (handleAction || hanldeEpics)(model, model.epics[0], model.state)
    );
  } else {
    return (handleAction || hanldeEpics)(model, model.epics || {}, model.state);
  }
}

/**
 * 处理单个epic，重载epic中的{put}方法
 * @param {any} model {namespace:"",actions:{},...}
 * @param {any} actionType 方法类型
 * @param {any} [epic=identify] 方法
 * @returns ActionsObservable<Action>
 */
function handleEpic(model, actionType, epic = identify) {
  return (action$, store) =>
    // action$.ofType(actionType).mergeMap(action => {
    epic(action$, store, actionType, res => {
      const newType = `${model.namespace}${NAMESPACE_SEP}${res.type}`;
      return { ...res, type: newType };
    });
  // });
}

/**
 * 处理epics
 * @param {any} model {namespace:"",actions:{},...}
 * @param {any} epics {"user/fetch":f,...}
 * @param {any} state {}
 * @returns 数组
 */
function hanldeEpics(model, epics, state) {
  const epicsArr = Object.keys(epics).map(type => {
    return handleEpic(model, type, epics[type]);
  });
  return epicsArr;
}

/**
 * 处理单个action，拼接上action的标识type
 * @param {any} actionType
 * @param {any} [action=identify] 方法
 * @returns
 */
function handleRealAction(actionType, action = identify) {
  return param => {
    const result = action(param);
    return {
      type: actionType,
      ...result
    };
  };
}

/**
 * 处理actions，形为{"user/fetch":f,...}
 * @param {any} actions 所有可用方法
 * @returns 方法对象
 */
function handleRealActions(actions) {
  const actionsObj = {};
  Object.keys(actions).map(type => {
    actionsObj[type] = handleRealAction(type, actions[type]);
  });
  return actionsObj;
}

/**
 * 合并actions
 * @param {any} models {namespace:"",actions:{},...}
 * @returns
 */
function mergeActions(...models) {
  const newActions = models.reduce((r, p) => {
    return Object.assign(r, p.actions);
  }, {});
  return newActions;
}

/**
 * 合并epics，从二维数组合并为一维数组
 * @param {any} expicArr 数组
 * @returns 数组
 */
function mergeEpics(...expicArr) {
  const newEpics = expicArr.reduce((r, p) => {
    return r.concat(p);
  }, []);
  return newEpics;
}

/**
 * 合并所有处理之后reducers，epics，actions
 * @param {any} models 原始的models文件
 * @returns {newActions,newReduces,newEpics}
 */
const mergeAllModels = (...models) => {
  let newReduces = {};
  let expicArr = [];
  models.map(mo => {
    //检验model并对model中各方法名修改${namespace}/${functionName}
    const newModel = model(mo);
    //处理model中reducer,namespace为reducer的key
    newReduces[newModel.namespace] = getReducer(
      newModel.reducers,
      newModel.state,
      handleReducers
    );
    //处理epic
    expicArr.push(getEpic(newModel, hanldeEpics));
  });
  //合并所有文件中actions
  const newActions = handleRealActions(mergeActions(...app._models));
  //合并所有文件中epics
  const newEpics = mergeEpics(...expicArr);
  return { newActions, newReduces, newEpics };
}

export default mergeAllModels;
