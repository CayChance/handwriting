function deepClone(target) {
  let visitedMap = new Map();
  function baseClone(target) {
    if (!isObject(target)) return target;
    // 先获取map中是否存在当前target，如果存在则直接返回
    if (visitedMap.get(target)) return visitedMap.get(target);
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
