function baseClone(target) {
  if (!isObject(target)) return target;
  let result = Array.isArray(target) ? [] : {};
  let keys = Object.keys(target);
  for (let i = 0, len = keys.length; i < len; i++) {
    result[keys[i]] = baseClone(target[keys[i]]);
  }
  return result;
}
function isObject(target) {
  return target !== null && typeof target === "object";
}

function deepClone(target) {
  let visitedMap = new Map();
  function baseClone(target) {
    if (!isObject(target)) return target;
    if (visitedMap.get(target)) return visitedMap.get(target); // 先获取map中是否存在当前target，如果存在则直接返回
    let result = Array.isArray(target) ? [] : {};
    visitedMap.set(target, result);
    let keys = Object.keys(target);
    for (let i = 0, len = keys.length; i < len; i++) {
      result[keys[i]] = baseClone(target[keys[i]]);
    }
    return result;
  }
  return baseClone(target);
}


var arr = [1, 2, 3];
var obj = {
  arr1: [],
  arr2: []
};
obj.arr1 = arr;
obj.arr2 = arr;
obj.arr1 === obj.arr2; // true
var cloneObj = baseClone(obj);
cloneObj.arr1 === cloneObj.arr2; // false
