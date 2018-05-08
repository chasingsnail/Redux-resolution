export const isArray = Array.isArray.bind(Array);
export const isFunction = o => typeof o === "function";
export function isAllFunction(obj) {
  return Object.keys(obj).every(key => isFunction(obj[key]));
}
