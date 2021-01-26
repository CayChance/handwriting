// es5手写call
Function.prototype.call = function (context) {
  var context = context || window;
  context.fn = this;
  var args = [];
  for (var i = 1, len = arguments.length; i < len; i++) {
    args.push("arguments[" + i + "]");
  }
  var result = eval("context.fn(" + args + ")");
  delete context.fn;
  return result;
};
// es5手写apply
Function.prototype.apply = function (context, arr) {
  var context = context || window;
  context.fn = this;
  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push("arr[" + i + "]");
    }
    result = eval("context.fn(" + args + ")");
  }
  delete context.fn;
  return result;
};

Function.prototype.myCall = function (context = window) {
  context.fn = this;
  let args = [...arguments].slice(1);
  let result = context.fn(...args);
  delete context.fn;
  return result;
};
Function.prototype.myApply = function (context = window) {
  context.fn = this;
  let result;
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
};

Function.prototype.bind = function (context) {
  // 1、返回一个函数
  // 2、里外两个函数均可拼接参数
  // 3、bind 返回的函数作为构造函数的时候，bind 时指定的 this 值会失效，但传入的参数依然生效。
  // 4、判断传入参数类型
  if (typeof this !== "function") {
    throw new Error(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var fNOP = function () {};
  var fBound = function () {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(
      this instanceof fNOP ? this : context,
      args.concat(bindArgs)
    );
  };
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
};

// 手写promise
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    // 存放成功的回调
    this.onResolvedCallback = [];
    // 存放失败的回调
    this.onRejectedCallback = [];

    let resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 依次将对应的函数执行
        this.onResolvedCallback.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 依次将对应的函数执行
        this.onRejectedCallback.map((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }

    if (this.status === REJECTED) {
      onRejected(this.reason);
    }

    if (this.status === PENDING) {
      // 如果promise的状态是 pending，需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再依次将对应的函数执行
      this.onResolvedCallback.push(() => {
        onFulfilled(this.value);
      });

      // 如果promise的状态是 pending，需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再依次将对应的函数执行
      this.onRejectedCallback.push(() => {
        onRejected(this.reason);
      });
    }
  }
}

Promise.prototype.all = function (arr) {
  // 1、返回的是个promise对象
  // 2、把传入的promise数组全部执行，并将结果存起来
  // 3、等全部执行完以后，返回结果
  let result = [];
  return new Promise((resolve, reject) => {
    for (let i in arr) {
      Promise.resolve(arr[i])
        .then((data) => {
          result[i] = data;
          if (result.length === arr.length) resolve(result);
        })
        .catch((e) => {
          reject(e);
        });
    }
  });
};

Promise.prototype.race = function (arr) {
  return new Promise((resolve, reject) => {
    for (let i in arr) {
      Promise.resolve(arr[i])
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e);
        });
    }
  });
};

// 调用
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("成功");
  }, 1000);
}).then(
  (data) => {
    console.log("success", data);
  },
  (err) => {
    console.log("faild", err);
  }
);

// 柯里化
// 函数科里化， 对函数的一种转换，例如：fn(a, b, c)可转化为fn(a)(b)(c)调用，本质上上一种函数转换
// 简单柯里化
function add(a, b) {
  console.log(a + b);
}
let adds = curry(add);
adds(3)(4);

const easyCurry = function (fn) {
  return function (a) {
    return function (b) {
      return fn(a, b);
    };
  };
};

// 复杂柯里化
function sum(a, b, c) {
  return a + b + c;
}
let curriedSum = curry(sum);
alert(curriedSum(1, 2, 3)); // 6，仍然可以被正常调用
alert(curriedSum(1)(2, 3)); // 6，对第一个参数的柯里化
alert(curriedSum(1)(2)(3)); // 6，全柯里化

const curry = function (fn) {
  return function curried(...args) {
    // 如果传入参数数大于函数可接受的参数数
    // 原封不动输出
    if (args.length >= fn.length) {
      // 最终还是返回fn 参数动态拼在一起
      return fn.apply(this, args);
    }
    // 否则
    else {
      // 把之前的参数拼在一起去调用curried
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
};

// 二叉树前序遍历 last
let result = [];
function loopTree(tree) {
  if (tree) {
    result.push(tree.value);
    loopTree(tree.left);
    loopTree(tree.right);
  }
}

// 防抖
// 定义：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
// 应用：输入框实时搜索，按钮防重复点击
function debounce(fn, delay, immediate) {
  let timer;
  return function () {
    if (timer) clearTimeout(timer);
    if (immediate) {
      fn.apply(this, arguments);
    } else {
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, delay);
    }
  };
}

// 节流
// 定义：规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效。
// 摁一下，发射一个子弹。最快每秒1发，如果1秒内触发了3次，还是只会发射一发。
// 监控浏览器resize
function throttle(fn, delay) {
  let prev = new Date();
  return function () {
    let now = new Date();
    if (now - prev > delay) {
      fn.apply(this, arguments);
      prev = new Date();
    }
  };
}

// 深拷贝
function isObject(target) {
  return target !== null && typeof target === "object";
}
// 简易版深拷贝
function deepClone(target) {
  // 不是对象直接返回
  if (!isObject(target)) return target;
  // 判断数组
  let result = Array.isArray(target) ? [] : {};//如果需要解决相同引用和循环引用，在此处前后使用map去存储和获取
  let keys = Object.keys(target);
  // 迭代目标对象的key来递归完成复制
  for (let i = 0, len = keys.length; i < len; i++) {
    result[keys[i]] = deepClone(target[keys[i]]);
  }
  return result;
}

/**
 * @description: 解决相同引用和循环引用的深拷贝版本
 */
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

class EventEmitter {
  constructor() {
    // 维护事件及监听者
    this.listeners = {};
  }
  /**
   * 注册事件监听者
   * @param {String} key 事件类型
   * @param {Function} fn 回调函数
   */
  on(key, fn) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(fn);
  }
  /**
   * 发布事件
   * @param {String} key 事件类型
   * @param  {...any} arg 参数列表，把emit传递的参数赋给回调函数
   */
  emit(key, ...arg) {
    if (this.listeners[key]) {
      this.listeners[key].forEach((fn) => {
        fn(...arg);
      });
    }
  }
  /**
   * 移除某个事件的一个监听者
   * @param {String} key 事件类型
   * @param {Function} fn 回调函数
   */
  off(key, fn) {
    if (this.listeners[key]) {
      const targetIndex = this.listeners[key].findIndex((item) => item === fn);
      if (targetIndex !== -1) {
        this.listeners[key].splice(targetIndex, 1);
      }
      if (this.listeners[key].length === 0) {
        delete this.listeners[key];
      }
    }
  }
  /**
   * 移除某个事件的所有监听者
   * @param {String} key 事件类型
   */
  offAll(key) {
    if (this.listeners[key]) {
      delete this.listeners[key];
    }
  }
}
// 创建事件管理器实例
const eve = new EventEmitter();
// 注册一个chifan事件监听者
eve.on("eat", function () {
  console.log("吃饭了，我们走！");
});
// 发布事件chifan
eve.emit("eat");
// 也可以emit传递参数
eve.on("eat", function (address, food) {
  console.log(`吃饭了，我们去${address}吃${food}！`);
});
eve.emit("eat", "三食堂", "铁板饭"); // 此时会打印两条信息，因为前面注册了两个chifan事件的监听者
// 测试移除事件监听
const toBeRemovedListener = function () {
  console.log("我是一个可以被移除的监听者");
};
eve.on("testoff", toBeRemovedListener);
eve.emit("testoff");
eve.off("testoff", toBeRemovedListener);
eve.emit("testoff"); // 此时事件监听已经被移除，不会再有console.log打印出来了
// 测试移除chifan的所有事件监听
eve.offAll("eat");
console.log(eve); // 此时可以看到eve.listeners已经变成空对象了，再emit发送chifan事件也不会有反应了

// 斐波那契数列
// 输入正整数n，输出0，1，1，2，3，5，8，13...
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 动态规划
function dynFib(n) {
  if (n === 0) return n;
  if (n <= 2) return 1;
  let result = [];
  for (let i = 0; i <= n; i++) {
    result[i] = 0;
  }
  result[1] = 1;
  result[2] = 1;
  for (let i = 3; i <= n; i++) {
    result[i] = result[i - 1] + result[i - 2];
  }
  return result[n];
}

// 冒泡排序
function bubbleSort(arr) {
  for (let i = 0, len = arr.length; i < len - 1; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
let arr = [5, 4, 3, 2, 1];
bubbleSort(arr);

// 插入排序
// 快速排序
function quickSort(arr){
  // 1、从数组arr中拿出中间项mid
  // 2、声明左右两个数组，循环arr，比mid小push到左数组，否则push到右数组
  // 3、对左右两个数组进行递归处理，把左数组，中间值，右数组拼在一起
  // 4、如果数组里面只有一项或者没有，那么原封不动返回数组
  if(arr.length<=1) return arr
  let middleIndex = parseInt(arr.length/2)
  let middleValue = arr.splice(middleIndex, 1)[0]
  let arrLeft = []
  let arrRight = []
  for(let i=0;i<arr.length;i++) {
    let item = arr[i];
    item<middleValue ? arrLeft.push(item) : arrRight.push(item)
  }
  return quickSort(arrLeft).concat(middleValue, quickSort(arrRight))
}
// 设计模式
// 工厂模式
// 单例模式
