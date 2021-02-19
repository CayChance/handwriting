Function.prototype.call = function (ctx) {
  var ctx = ctx || window
  ctx.fn = this
  var args = []
  for (var i = 1, len = arguments.length; i < len; i++) {
    args.push('arguments[' + i + ']')
  }
  var result = eval('ctx.fn(' + args + ')')
  delete ctx.fn
  return result
}

Function.prototype.apply = function (ctx, arr) {
  var ctx = ctx || window
  ctx.fn = this
  var result = []
  if (!arr) {
    result = ctx.fn()
  }
  else {
    var args = []
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push('arr[' + i + ']')
    }
    result = eval('ctx.fn(' + args + ')')
  }
  delete ctx.fn
  return result
}

Function.prototype.bind = function (ctx) {
  var self = this
  var args1 = Array.prototype.slice.call(arguments, 1)
  var fnNop = function () { }
  var fnBound = function () {
    var args2 = Array.prototype.slice.call(arguments)
    return self.apply(this instanceof fnNop ? this : ctx, args1.concat(args2))
  }
  fnNop.prototype = this.prototype
  fnBound.prototype = new fnNop()
  return fnBound
}

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
class Promise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolvedCallback = []
    this.onRejectedCallback = []

    let resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        this.onResolvedCallback.map(fn => fn())
      }
    }
    let reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejectedCallback.map(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onResolved, onRejected) {
    if (this.status === FULFILLED) {
      onResolved(this.value)
    }
    if (this.status === REJECTED) {
      onRejected(this.reason)
    }
    if (this.status === PENDING) {
      this.onResolvedCallback.push(() => {
        onResolved(this.value)
      })

      this.onRejectedCallback.push(() => {
        onRejected(this.reason)
      })
    }
  }
}
Promise.prototype.all = function (arr) {
  return new Promise((resolve, reject) => {
    let result = []
    let count = 0
    for (let i in arr) {
      Promise.resolve(arr[i]).then(data => {
        result[i] = data
        if (++count === arr.length) {
          resolve(result)
        }
      }).catch(e => {
        reject(e)
      })
    }
  })
}

Promise.prototype.race = function (arr) {
  return new Promise((resolve, reject) => {
    for (let i in arr) {
      Promise.resolve(arr[i]).then(data => {
        resolve(data)
      }).catch(e => {
        reject(e)
      })
    }
  })
}

const easyCurry = function (fn) {
  return function (a) {
    return function (b) {
      return fn(a, b)
    }
  }
}

const curry = function (fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}

function debounce(fn, delay, immediate) {
  let timer
  return function () {
    if (timer) clearTimeout(timer)
    if (immediate) {
      fn.apply(this, arguments)
    }
    else {
      timer = setTimeout(() => {
        fn.apply(this, arguments)
      }, delay);
    }
  }
}

function throttle(fn, delay) {
  let prev = new Date()
  return function () {
    let now = new Date()
    if (now - prev > delay) {
      fn.apply(this, arguments)
      prev = new Date()
    }
  }
}

function baseClone(target) {
  if (!isObject(target)) return target
  let result = Array.isArray(target) ? [] : {}
  let keys = Object.keys(target)
  for (let i = 0, len = keys.length; i < len; i++) {
    let key = keys[i]
    result[key] = baseClone(target[key])
  }
  return result
}

function deepClone(target) {
  let visitedMap = new Map()
  function baseClone(target) {
    if (!isObject(target)) return target
    if (visitedMap.get(target)) return visitedMap.get(target)
    let result = Array.isArray(target) ? [] : {}
    visitedMap.set(target, result)
    let keys = Object.keys(target)
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i]
      result[key] = baseClone(target[key])
    }
    return result
  }
  return baseClone(target)
}

class EventEmitter {
  constructor() {
    this.listener = {}
  }

  on(key, fn) {
    if (!this.listener[key]) {
      this.listener[key] = []
    }

    this.listener[key].push(fn)
  }
  emit(key, ...args) {
    if (this.listener[key]) {
      this.listener[key].forEach(fn => {
        fn(...args)
      })
    }
  }
  off(key, fn) {
    if (this.listener[key]) {
      const index = this.listener[key].findIndex(item => item === fn)
      if (index !== -1) {
        this.listener[key].splice(index, 1)
      }

      if (this.listener[key].length === 0) {
        delete this.listener[key]
      }
    }
  }
  offAll(key) {
    if (this.listener[key]) {
      delete this.listener[key]
    }
  }
}

function bubbleSort(arr) {
  for (let i = 0, len = arr.length; i < len - 1; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
  }
  return arr
}
// bubble quick