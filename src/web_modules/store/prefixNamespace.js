import warning from "warning";
import { isArray } from "../utils";
import { NAMESPACE_SEP } from "../constants";

function prefix(obj, namespace, type) {
  return Object.keys(obj).reduce((memo, key) => {
    warning(
      key.indexOf(`${namespace}${NAMESPACE_SEP}`) !== 0,
      `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`
    );
    const newKey = `${namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

export default function prefixNamespace(model) {
  const { namespace, reducers, epics, actions } = model;

  if (reducers) {
    if (isArray(reducers)) {
      model.reducers[0] = prefix(reducers[0], namespace, "reducer");
    } else {
      model.reducers = prefix(reducers, namespace, "reducer");
    }
  }
  if (epics) {
    model.epics = prefix(epics, namespace, "epics");
  }

  if (actions) {
    model.actions = prefix(actions, namespace, "actions");
  }

  return model;
}
