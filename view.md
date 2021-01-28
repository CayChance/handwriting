### webpack构建速度优化有哪些方式
- 分析打包速度和体积，合理进行优化
  1. 使用SMP(speed-measure-webpack-plugin) 速度分析
  2. webpack-bundle-analyzer 体积分析
- 打包速度：
  - 多进程，多实例构建 
    1. thread-loader(将模块以及依赖分配给worker线程中)
    2. happypack(不建议对loader使用)
    3. parallel-webpack(可并行运行多个Webpack构建)
  - 缩小打包作用域
    1. exclude/include (确定 loader 规则范围，babel-loader不去解析node_modules)
    2. resolve.modules 指明第三方模块的绝对路径 (减少不必要的查找)
    3. resolve.extensions 尽可能减少后缀尝试的可能性
    4. noParse 忽略不需要解析的库 Jquery, loadsh
  - 利用缓存提升速率
    1. babel-loader开启缓存
    2. 使用cache-loader等
  - 开启DLL
    1. 分包。使用DllPlugin进行分包，能把第三方库代码分离开，每次文件更改的时候，它只会打包该项目自身的代码。合理使用manifest.json文件
    2. 减少对不频繁更新的库的编译。使用 DllPlugin 将不频繁更新的库进行编译以后，当这些依赖的版本没有变化时，就不需要重新编译

- 打包体积优化
  - 压缩代码
    1. webpack-parallel-uglify-plugin
    2. uglify-webpack-plugin
    3. terser-webpack-plugin
  - 图片压缩
    1. image-webpack-loader
  - Tree shaking 抖动树，尽可能的避免打入无用代码，可在package中配置告诉webpack安全的删除未用到的export
    1. 实际情况中，虽然依赖了某个模块，但其实只使用其中的某些功能。通过 tree-shaking，将没有使用的模块摇掉，这样来达到删除无用代码的目的。
  - 提取公共资源

### 性能优化方案

##### 合理设置api，减少请求数

##### 使用http2.0
- **新的二进制格式**（Binary Format），HTTP1.x的解析是基于文本。
基于文本协议的格式解析存在天然缺陷，文本的表现形式有多样性，要做到健壮性考虑的场景必然很多，二进制则不同，只认0和1的组合。基于这种考虑HTTP2.0的协议解析决定采用二进制格式，实现方便且健壮。

- **多路复用**（MultiPlexing）
即连接共享，即每一个request都是是用作连接共享机制的。一个request对应一个id，这样一个连接上可以有多个request，每个连接的request可以随机的混杂在一起，接收方可以根据request的 id将request再归属到各自不同的服务端请求里面。

- **header压缩**
如上文中所言，对前面提到过HTTP1.x的header带有大量信息，而且每次都要重复发送，HTTP2.0使用encoder来减少需要传输的header大小，通讯双方各自cache一份header fields表，既避免了重复header的传输，又减小了需要传输的大小。

- **服务端推送**（server push）
同SPDY一样，HTTP2.0也具有server push功能。

##### 服务端渲染和静态化

- 如果对于首屏要求较高并要求seo则服务端渲染为做好的选择，由服务端返回html客户端直接渲染。
- 静态化类似其实是一种特定的服务端渲染，比如我们一些静态的文章页不太变化的可以直接由服务端渲染完成，甚至读取一部分服务端缓存来完成。

##### 静态资源一定上cdn

##### css放在head中，js放在body最后
css和js其实都会阻塞渲染，但是如果css放在底部会存在首屏样式错乱的问题，js如果必须放到头部，最好加上defer标签，异步下载，延迟执行。

##### 用字体图标代替图片图标

我们开发中也会遇到这样的问题，如果使用图片可能回存在闪屏的问题，字体图标则不会，而且我们可以对字体文件进行压缩。

##### 灵活使用缓存技术
1. http缓存根据情况来选择强制缓存或者协商缓存
2. 对一些实时性不高的数据可做本地缓存

##### 压缩文件

##### 图片懒加载
当图片即将展示在视口内时再加载图片，统一图片默认图；尽量使用webp图片；利用css3代替图片效果，压缩图片，降低质量，其实web对于图片质量的要求并不高，尤其是pc端，但是移动端慎重。

##### 路由懒加载

原理是利用webapck将单文件组件的页面全部打包为单一的js文件，然后在appjs中维护路由模块关系，比如路由切换到/about时，加载about页面对应的js 文件，完成渲染，避免首次就要加载所有js文件。

##### 慎重选择第三方库

- 比如同样是处理时间的需求，如果dayjs能满足的需求为什么要用momentjs呢？同样的功能会增加很多代码量。
- 利用webpack提取第三方代码，设置webpack4的 splitChunk 插件 cacheGroups 选项

##### 减少重排重绘

> 重排是当元素大小位置改变时产生

> 重绘是当元素字体大小、颜色等改变产生的

**重绘不一定重排，重排一定会重绘**
◊
1. 用 JavaScript 修改样式时，最好不要直接写样式，而是替换 class 来改变样式。
2. 如果要对 DOM 元素执行一系列操作，可以将 DOM 元素脱离文档流，修改完成后，再将它带回文档。推荐使用隐藏元素（display:none）或文档碎片（**DocumentFragement**），都能很好的实现这个方案。

##### 保证最少60fps的刷新率

##### 使用requestAnimationFrame代替定时器完成动画
定时器是按照时间来完成，但是requestAnimationFrame是根据帧来完成动画的，也就是保证了刷新率，不会存在卡顿的情况。

##### 使用webWorker来完成复杂计算

虽然worker中不能处理dom，但是可以将计算结果返回给我们，然后完成渲染。
****

### js的垃圾回收机制

- 引用计数垃圾收集 
  概念：语言引擎有一张"引用表"，保存了内存里面所有的资源（通常是各种值）的引用次数。如果一个值的引用次数是0，就表示这个值不再用到了，因此可以将这块内存释放；
  缺点：该算法有一个限制——循环引用。
- 标记-清除垃圾回收算法
  1. 垃圾收集器找到所有的根，并“标记”（记住）它们。
  2. 然后它遍历并“标记”来自它们的所有引用。
  3. 然后它遍历标记的对象并标记 它们的 引用。所有被遍历到的对象都会被记住，以免将来再次遍历到同一个对象。
  4. ……如此操作，直到所有可达的（从根部）引用都被访问到。
  5. 没有被标记的对象都会被删除。
  6. 2012年起，所有现代浏览器都是用了该算法
****

### 模块化
名称      | CommonJS | AMD      | CMD       | ES6
 :-:     | :-:      | :-:      | :-:        | :-:
API      | module.exports+require  | define+require | define+require | export+import
执行环境  | 服务端    | 客户端     | 客户端     | 服务端+客户端
执行方式  | 运行时加载 | 运行时加载 | 运行时加载  | 编译时加载
同步/异步 | 同步      | 异步      | 需要时加载  |  

### ES6模块和CommonJs模块的区别 
- commonJs是运行时加载，es6是编译时加载
- commonJs输出的是值的浅拷贝，es6输出的是值的引用
- commentJs具有缓存。在第一次被加载时，会完整运行整个文件并输出一个对象，拷贝（浅拷贝）在内存中。下次加载文件时，直接从内存中取值
- 循环引用 
  1. CommonJS的做法是，一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出。
  2. ES6根本不会关心是否发生了"循环加载"，只是生成一个指向被加载模块的引用，需要开发者自己保证，真正取值的时候能够取到值。
- Node的默认模块格式是CommonJS，要通过Babel这样的转码器，在Node里面使用ES6模块
- 参考链接 
[传送门-掘金-CommonJs 和 ESModule 的 区别整理](https://juejin.im/post/5ae04fba6fb9a07acb3c8ac5)
[传送门-JavaScript 模块的循环加载](http://www.ruanyifeng.com/blog/2015/11/circular-dependency.html)
****

### var/let/const 区别
声明方式 | 变量提升 | 重复声明 | 暂时性死区 | 初始值 | 作用域
 :-: | :-: | :-: | :-: | :-: | :-:
var   | 允许  | 允许 | 不存在 | 不需要 | 除块级
let   | 不允许 | 不允许 | 存在  | 需要 | 块级
const | 不允许 | 不允许 | 存在  | 需要 | 块级

const实际上保证的，并**不是变量的值不得改动**，而是**变量指向的那个内存地址所保存的数据不得改动**。
****

### 箭头函数和普通函数的区别
- 箭头函数声明时绑定thi
- 普通函数执行时绑定this
- 箭头函数不能用于**构造函数**，不能使用**new**，不能**call,apply,bind**，不能当作**generator函数**，不能使用**yield**，没有**arguments**，没有**prototype**。
****

### for in/for of/for 遍历对象
> for...in语句以任意顺序遍历一个对象自有的、继承的、可枚举的、非Symbol的属性。对于每个不同的属性，语句都会被执行。

> for...of语句在可迭代对象（包括 Array，Map，Set，String，TypedArray，arguments 对象等等）上创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句

- for in 

  1. 可以遍历数组和对象。可以获取key和value。
  2. 适用于普通对象，并且做了对应的优化。但是不适用于数组，因此速度要慢 10-100 倍。（适用，适合的意思，而不是不能使用的意思。）
  3. 循环会遍历 所有属性，不仅仅是这些数字属性。

- for of 

  1. 可以遍历数组，**不可遍历对象**。只能获取value
  2. 性能更好
  3. 遍历具有迭代器属性的对象。因此如果某个对象有迭代器属性，也是可以遍历的。

- for循环就是遍历数组的方法。
****
### Event Loop
Event Loop分为**浏览器中的Event Loop**和**Node中的Event Loop**

[传送门-JS Event Loop](https://caychance.github.io/posts/js-event-loop/)

### 浏览器中的Event Loop
>（1）所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。

>（2）主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。

>（3）一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。

>（4）主线程不断重复上面的第三步。

### Node中的Event Loop
>（1）V8引擎解析JavaScript脚本。

>（2）解析后的代码，调用Node API。

>（3）libuv库负责Node API的执行。它将不同的任务分配给不同的线程，形成一个Event Loop（事件循环），任务的执行结果会以异步的方式返回给V8引擎。

>（4）V8引擎再将结果返回给用户。

### 宏任务和微任务的执行顺序
>（1）先执行宏任务，执行完后，查看是否有微任务队列

>（2）如果有微任务队列，则执行微任务

>（3）如果没有，则读取宏任务中排在最前列的任务

>（4）执行宏任务的过程中遇到微任务，则加入微任务队列

>（5）执行完宏任务后，查看是否有微任务队列

### 常见的宏任务和微任务
- 宏任务

script、setTimeout、setInterval、setImmediate、requestAnimationFrame、I/O、UI Rendering

- 微任务

new Promise().then(回调)、Process.nextTick、MutationObserver

``` js
console.log(1);
async function async1(){
  console.log(2);
  await console.log(3);
  console.log(4);
}
setTimeout(function(){
  console.log(5)
},0)
async1();
new Promise(function(resolve){
  console.log(6);
  resolve();
  console.log(9);
}).then(function(){
  console.log(7);
});
console.log(8);
// 1 2 3 6 9 8 4 7 5
```

### Node的执行顺序
数据输入 => poll轮询 => check检查 => close callbacks关闭事件回调 => timers定时器 => I/O callbacks I/O事件回调 => idle prepare 闲置 => 轮询

## Vue部分

### Vue提倡的是单向数据流，但是v-model是双向数据流，为什么?
- v-model只是一个语法糖，本质还是单向数据流
- v-bind:value和v-on:input

### Vue双向绑定实现原理/数据响应系统原理

[vue原理。
](https://caychance.github.io/posts/vue%E5%8E%9F%E7%90%86%E8%A7%A3%E6%9E%90%E7%AC%94%E8%AE%B0/)

* 响应式对象，核心就是利用 Object.defineProperty 给数据添加了 getter 和 setter，目的就是为了在我们访问数据以及写数据的时候能自动执行一些逻辑：getter 做的事情是依赖收集，setter 做的事情是派发更新

* 收集依赖的目的是为了当这些响应式数据发生变化，触发它们的 setter 的时候，能知道应该通知哪些订阅者去做相应的逻辑处理

* 当数据发生变化的时候，触发 setter 逻辑，把在依赖过程中订阅的的所有观察者，也就是 watcher，都触发它们的 update 过程

* 当 render function 被渲染的时候，因为会读取所需对象的值，所以会触发 getter 函数进行「依赖收集」，「依赖收集」的目的是将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中。

* 在修改对象的值的时候，会触发对应的 setter， setter 通知之前「依赖收集」得到的 Dep 中的每一个 Watcher，告诉它们自己的值改变了，需要重新渲染视图。这时候这些 Watcher 就会开始调用 update 来更新视图。

![](https://blog-pics.pek3b.qingstor.com/006tNc79ly1g2v2c39ruvj311e0rudpq.jpg)

``` js
//响应式
function defineReactive (obj,key,val) {
  let dep = new Dep();
  Object.defineProperty(obj, key, {
    get(){
      // 依赖收集
      dep.depend();
      return val;
    },
    set(newVal){
      val = newVal;
      // 派发更新；数据变化通知所有订阅者
      dep.notify()
    }
  })
}
// Dep是整个getter依赖收集的核心
class Dep {
  constructor(){
    this.subs = []
  },
  //增加订阅者
  addSub(sub){
    this.subs.push(sub);
  },
  //判断是否增加订阅者
  depend () {
    if (Dep.target) {
      this.addSub(Dep.target)
    }
  },

  //通知订阅者更新
  notify(){
    this.subs.forEach((sub) =>{
      sub.update()
    })
  }
}
Dep.target = null;
```

### Vue中，数组的操作是如何实现数据响应的(push等原型函数以及为什么用$set)

- todo

### provide/inject能解决什么问题

- todo

### computed和props/data的区别，其实现原理是什么

- todo

### Vue Router
- 主要有两种模式 **hash模式** **history模式**
- **本质**就是监听url的变化，然后匹配路由规则，显示相应的页面，并且无需刷新
- hash模式	点击跳转通过hashchange事件来监听到url的变化	手动刷新通过load事件
- history模式		点击跳转通过pushState	浏览器动作 回退等 popState		刷新或者输入url 会向服务器发送请求 **需要后端配合重定向**

### Vuex数据周期 如何使用 有什么好处
state -- dispatch --> actions -- commit --> mutations

### vue.nextTick的原理 如何找到dom 依赖收集过程
- nextTick是Vue的一个全局函数，用于处理dom更新操作。Vue里面有一个watcher，用于观察数据的变化，然后更新dom。Vue里面并不是每次数据变化都会触发更新dom，而是将这些操作都缓存在一个队列，在一个事件循环结束之后，刷新队列，统一执行dom操作。
- watch的实现，当某个响应式数据发生变化的时候，它的setter函数会通知闭包中的Dep，Dep则会调用它管理的所有Watch对象。触发Watch对象的update实现。**Watch对象并不是立即更新视图，而是被push进了一个队列queue，此时状态处于waiting的状态，这时候继续会有Watch对象被push进这个队列queue，等待下一个tick时，这些Watch对象才会被遍历取出，更新视图。**同时，id重复的Watcher不会被多次加入到queue中去，因为在最终渲染时，我们只需要关心数据的最终结果。
- Vue 实现响应式并不是数据发生变化之后 DOM 立即变化，而是按一定的策略进行 DOM 的更新。
- Vue是异步执行dom更新的
- Vue 在修改数据后，视图不会立刻更新，而是等同一事件循环中的所有数据变化完成之后，再统一进行视图更新。
- 源码中
  - 2.5版本使用宏任务和微任务组合
  - 源码中依次判断的逻辑：先看是否可以使用Promise，MutationObserver，setImmediate，setTimeout

### virtual-dom	diff算法具体实现过程
- diff算法源于snabbdom，复杂度为O(n)
- 只会在同层级比较，不会跨层级比较
- 重点是patch方法

### patch方法详解
注释：vnode：新的虚拟节点 oldVnode：旧的虚拟节点

>
- vnode不存在但是oldVnode存在，需要销毁oldVnode
- oldVnode不存在但是vnode存在，创建新节点
- oldVnode和vnode都存在
  - oldVnode和vnode是同一个节点 执行patchVnode方法
  - vnode创建真实dom并替换oldVnode.elm

### patchVnode方法详解
>
- oldVnode和vnode完全一致，则不需要做任何事情
- oldVnode和vnode都是静态节点，且具有相同的key，当vnode是克隆节点或是v-once指令控制的节点时，只需要把oldVnode.elm和oldVnode.child都复制到vnode上即可
- vnode不是文本节点或注释节点
  - 如果oldVnode和vnode都有子节点，且2方的子节点不完全一致，就执行updateChildren方法
  - 只有oldVnode有子节点，那就把这些节点都删除
  - 如果只有vnode有子节点，那就创建这些子节点
  - 如果oldVnode和vnode都没有子节点，但是oldVnode是文本节点或注释节点，就把vnode.elm的文本设置为空字符串
- vnode是文本节点或注释节点，但是vnode.text != oldVnode.text时，只需要更新vnode.elm的文本内容就可以

### updateChildren方法详解
>
- oldStartIdx>oldEndIdx
oldCh已经遍历完了，但是newCh还没有，把newStartIdx-newEndIdx之间的vnode都是新增的，把这些vnode添加到oldCh末尾
- newStartIdx>newEndIdx
newCh已经遍历完了，但是oldCh还没有，把oldCh中oldStartIdx-oldEndIdx之间的vnode删除
- oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx
  - oldVnode第一个child不存在，oldStart索引右移
  - oldVnode最后一个child不存在，oldEnd索引左移
  - oldStartVnode和newStartVnode是同一个节点，patchVnode两个节点，索引右移
  - oldEndVnode和newEndVnode是同一个节点，patchVnode两个节点，索引左移
  - oldStartVnode和newEndVnode是同一个节点，移动oldStartVnode到oldEndVnode节点后面
  - oldEndVnode和newStartVnode是同一个节点，移动oldEndVnode到oldStartVnode前面
  - oldChildren中寻找跟newStartVnode具有相同key的节点，如果找不到相同key的节点，说明newStartVnode是一个新节点，就创建一个，然后把newStartVnode设置为下一个节点
  - 如果找到了相同key的节点，比较两个节点是否属于同一个节点，如果属于同一节点，就patchVnode，否则新创建节点

### 为什么要使用key？
不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效的利用dom。

## Wepack以及项目优化

### webpack原理和手写实现
主要分为以下三步：
1. 转换代码，生成依赖
  - 这部分比较简单就是babel转ast然后babel遍历ast保存所有依赖，然后生成对应的文件。
2. 生成依赖图谱
  - 依赖图谱就是一个json文件标明了单前文件依赖了哪些文件，code是啥类似下面数据：
  ```json
  {
    './index.js': {
      dependencies: { './message.js': './message.js' },
      code: '"use strict";\n\nvar _message = _interopRequireDefault(require("./message.js"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\n// index.js\nconsole.log(_message["default"]);'
    },
    './message.js': {
      dependencies: { './word.js': './word.js' },
      code:
        '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = void 0;\n\nvar _word = require("./word.js");\n\n// message.js\nvar message = "say ".concat(_word.word);\nvar _default = message;\nexports["default"] = _default;'
    },
    './word.js': {
      dependencies: {},
      code:
        '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.word = void 0;\n// word.js\nvar word = "hello";\nexports.word = word;' 
      }
    }
  ```

3. 生成代码字符串
  - 根据上一步生成的依赖图谱将所有代码串联起来生成代码字符串然后输出文件

### loader和plugin的区别
- loader
loaders是在打包构建过程中用来处理源文件的(JSX,Scss,Less)，一次处理一个；
- plugin
plugins并不直接操作单个文件，它直接对整个构建过程起作用。

## 浏览器及安全

### 阻止冒泡   
- stopPropagation   
- cancelBubble

### 常见的浏览器安全问题
- XSS 跨站脚本攻击

> XSS 的原理是恶意攻击者往 Web 页面里插入恶意可执行网页脚本代码，当用户浏览该页之时，嵌入其中 Web 里面的脚本代码会被执行，从而可以达到攻击者盗取用户信息或其他侵犯用户安全隐私的目的。

- CSRF 跨站请求伪造攻击

> 1.浏览器登录信任网站A 

> 2.通过验证，在浏览器中产生cookie 

> 3.用户在没有登出A的情况下，访问危险网站B 

> 4.B要求访问A网站，并发一个请求 

> 5.根据B的要求，浏览器待着cookie访问A

- SQL注入
- 命令行注入
- DDos攻击

> 原理就是利用大量的请求造成资源过载，导致服务不可用

- 流量劫持
  - DNS劫持
  
  > "你打了一辆车想去商场吃饭，结果你打的车是小作坊派来的，直接给你拉到小作坊去了"

  - HTTP劫持
  
  > "你打了一辆车想去商场吃饭，结果司机跟你一路给你递小作坊的广告"

### chrome跨标签通信
- 获取句柄 postMessage
- localStorage
- cookie
- SharedWorker

### 跨域
- jsonp 
- CORS 
- WebSocket 
- Nginx代理 
- Node中间件代理 `http-proxy-middleware` `proxy-middleware`

### 输入网址回车之后浏览器做了什么
以chrome为例：

- 输入地址
  会从历史记录，书签等地方智能提示补全url。查找缓存。
- NDS解析
- TCP请求
- 浏览器向服务器发送一个 HTTP 请求
- 服务器的永久重定向相应(如果有的话)
- 浏览器跟踪重定向地址
- 服务器处理请求
- 服务器返回一个 HTTP 响应
- 浏览器显示HTML
- 浏览器发送请求获取嵌入在 HTML 中的资源(图片，CSS，JS，音频，视频)

[传送门-老生常谈-从输入url到页面展示到底发生了什么](https://xianyulaodi.github.io/2017/03/22/%E8%80%81%E7%94%9F%E5%B8%B8%E8%B0%88-%E4%BB%8E%E8%BE%93%E5%85%A5url%E5%88%B0%E9%A1%B5%E9%9D%A2%E5%B1%95%E7%A4%BA%E5%88%B0%E5%BA%95%E5%8F%91%E7%94%9F%E4%BA%86%E4%BB%80%E4%B9%88/)

### 浏览器缓存机制
1. 先判断是否命中强缓存。如果命中，则不请求服务器，直接从缓存中返回数据；
2. 如果未命中，则向服务器发送一个请求，再判断是否命中协商缓存。发送的请求包含etag等协商缓存的信息，由服务器判断是否命中，返回内容（未命中）或者304（命中）。
  - 如果命中，更新缓存，然后缓存中返回数据；
  - 如果未命中，则更新缓存标识，服务器返回数据。
强缓存字段：Expires和Cache-Control
协商缓存字段：Last-Modified/If-Modified-Since和Etag/If-None-Match。后者优先级更高

## 网络相关

### Http状态码
- 1**	信息类
- 2**	成功
- 3**	重定向类	301永久重定向 302临时重定向
- 4**	客户端出错
- 5**	服务器出错
- 200成功/204无内容
- 301永久重定向/302临时重定向/304未修改
- 401未授权/403禁止访问/404未找到/405请求方式不对
- 500服务器内部错误/502错误网关/503服务不可用/504服务器超时

### Http header中都有哪些信息
`Accept`，`Connection`，`Content-Type`，`Expires`，`Server`，`Etag`，`Last-Modified`，`Server`，`Date`，`Cache-Control`，`User-Agent`等。

### Http和Https的区别
Http主要有三点不足。

- 通信使用明文，未加密。导致内容可能会被窃听。
- 不验证通讯方的身份。有可能遭遇伪装。
- 无法证明报文的完整性。有可能已遭篡改。

Https的出现也是为了解决上述问题。因此：
Http+加密+认证+完整新保护 = Https。
Https是身披SSL外壳的Http。SSL协议在Http和Tcp协议之间。

### TCP三次握手过程
![](https://blog-pics.pek3b.qingstor.com/006tNc79ly1g2w0tmm5q9j30rs0a8gpa.jpg)

- 第一次握手。client发送一个**SYN(J)**包给server，等待server的ACK回复，进入`SYN-SENT`状态。
- 第二次握手。server接收到SYN(seq=J)包后就返回一个**ACK(J+1)**包以及一个自己的**SYN(K)**包，然后等待client的ACK回复，server进入`SYN-RECIVED`状态。
- 第三次握手。client接收到server发回的ACK(J+1)包后，进入`ESTABLISHED`状态。然后根据server发来的SYN(K)包，返回给等待中的server一个**ACK(K+1)**包。等待中的server收到ACK回复，也把自己的状态设置为`ESTABLISHED`。

### TCP四次挥手
![](https://blog-pics.pek3b.qingstor.com/006tNc79ly1g2w0vh8dq6j30rs0cwq6e.jpg)

- 第一次挥手。client发送一个**FIN(M)**包，此时client进入`FIN-WAIT-1`状态，这表明client已经没有数据要发送了。
- 第二次挥手。server收到了client发来的FIN(M)包后，向client发回一个**ACK(M+1)**包，此时server进入`CLOSE-WAIT`状态，client进入`FIN-WAIT-2`状态。
- 第三次挥手。server向client发送**FIN(N)**包，请求关闭连接，同时server进入`LAST-ACK`状态。
- 第四次挥手。client收到server发送的FIN(N)包，进入`TIME-WAIT`状态。向server发送**ACK(N+1)**包，server收到client的ACK(N+1)包以后，进入`CLOSE`状态；client等待一段时间还没有得到回复后判断server已正式关闭，进入`CLOSE`状态。

### 为什么TCP建立连接是三次而关闭连接要多一次
因为server的ACK和FIN是分开发送了，因此关闭多了一次。
client发送一个FIN包，表示client已经没有数据要发送了。但是此时server可能还会有未发送的数据，因此server也要发送一个FIN包。

### Https认证过程
- 浏览器发送一个连接请求给安全服务器。
- 服务器将自己的证书，以及同证书相关的信息发送给客户浏览器。
- 客户浏览器检查服务器送过来的证书是否是由自己信赖的 CA 中心所签发的。如果是，就继续执行协议；如果不是，客户浏览器就给客户一个警告消息：警告客户这个证书不是可以信赖的，询问客户是否需要继续。
- 接着客户浏览器比较证书里的消息，例如域名和公钥，与服务器刚刚发送的相关消息是否一致，如果是一致的，客户浏览器认可这个服务器的合法身份。
- 服务器要求客户发送客户自己的证书。收到后，服务器验证客户的证书，如果没有通过验证，拒绝连接；如果通过验证，服务器获得用户的公钥。
- 客户浏览器告诉服务器自己所能够支持的通讯对称密码方案。
- 服务器从客户发送过来的密码方案中，选择一种加密程度最高的密码方案，用客户的公钥加过密后通知浏览器。
- 浏览器针对这个密码方案，选择一个通话密钥，接着用服务器的公钥加过密后发送给服务器。
- 服务器接收到浏览器送过来的消息，用自己的私钥解密，获得通话密钥。
- 服务器、浏览器接下来的通讯都是用对称密码方案，对称密钥是加过密的。

### HTTP2相比HTTP1多了什么

- **新的二进制格式**（Binary Format），HTTP1.x的解析是基于文本。
基于文本协议的格式解析存在天然缺陷，文本的表现形式有多样性，要做到健壮性考虑的场景必然很多，二进制则不同，只认0和1的组合。基于这种考虑HTTP2.0的协议解析决定采用二进制格式，实现方便且健壮。

- **多路复用**（MultiPlexing）
即连接共享，即每一个request都是是用作连接共享机制的。一个request对应一个id，这样一个连接上可以有多个request，每个连接的request可以随机的混杂在一起，接收方可以根据request的 id将request再归属到各自不同的服务端请求里面。

- **header压缩**
如上文中所言，对前面提到过HTTP1.x的header带有大量信息，而且每次都要重复发送，HTTP2.0使用encoder来减少需要传输的header大小，通讯双方各自cache一份header fields表，既避免了重复header的传输，又减小了需要传输的大小。

- **服务端推送**（server push）
同SPDY一样，HTTP2.0也具有server push功能。

### HTTP2的多路复用和HTTP 1.1的keep-alive有什么区别

- HTTP/1.0 一次请求-响应，建立一个连接，用完关闭；每一个请求都要建立一个连接；

- HTTP/1.1 Pipeling解决方式为，若干个请求排队串行化单线程处理，后面的请求等待前面请求的返回才能获得执行机会，一旦有某请求超时等，后续请求只能被阻塞，毫无办法，也就是人们常说的线头阻塞；

- HTTP/2多个请求可同时在一个连接上并行执行。某个请求任务耗时严重，不会影响到其它连接的正常执行。

### cookie
- expires	过期时间
- domain	域名
- path	路径
- security	安全情况下才传输给服务器 https
- httponly	js是否可以操作
- 如何防止js访问cookie，如何限制只能在https中才能访问cookie(set-cookie相关字段)

## 算法

### 递归的复杂度

### 快排的时间复杂度和空间复杂度

### 冒泡排序
``` js
for(let i=0;i<a.length-1;i++){
  for(let j=0;j<a.length-i-1;j++){
    if(a[j]>a[j+1]){
      [a[j],a[j+1]] = [a[j+1],a[j]];
    }
  }
}
```

### 给个数组和n，找到数组里的三个数相加是n，复杂度要求O(n^2*logn)

### 对数组[2, 3, 3, 2, 5]进行多重相邻去重(第一次去重后结果[2, 2, 5]，然后得到[ 5 ])，复杂度要求O(n)

### 给一个二叉树，每个节点有value，找到是否存在一条路径，从根路径到叶节点的value相加为n

### 给一个二叉树，找到深度为n的一层，这一层的节点是所有层中最多的一层

### 二叉树广度优先遍历

### 给一个二维数组，写一个函数，回字形走法，走过的节点不能再走，走到不能走为止

### 给一个二维数组，如[[0, 0, 0], [1, 0, 0], [0, 1, 0]]，1不能经过0能经过，给一个起点和一个终点，找到一条到终点的路径

### 反转链表

### 数组类

``` js
/*
一个数组arr，不新建变量，过滤掉arr中大于5的，并输出arr
*/
for(let i=0,len=arr.length;i<len;){
  if(arr[i]>5){
    arr.splice(i,1);
  }
  else{
    i++;
  }
}
```

## 其他

### 大文件上传
- 文件切片
  - 通过Blob对象的slice方法将目标大文件切割成小片，存放在数组中
- 上传切片
  - 正常formdata上传即可，将所有切片拿出依次上传，还原的时候需要个唯一标识来区分分片的位置，可以用filename + length的形式，当然根据file做一些处理生成唯一标识也可以
- 断点续传
  - 断点续传的逻辑主要在记录已上传的切片，然后再上传前检索保存记录，如果已经上传过了则break，这样在断点续传的时候就可以完成未上传切片继续上传。
- 上传进度
  - 使用xhr对象中的progress来实现


### 设计模式

#### 1. 工厂与抽象工厂模式
> 工厂模式主要用于创建类或者对像，目的就是建造一个可以批量生产某些具有相同功能的类。
##### 1.1 简单工厂模式

```javascript
function PopFactory (type) {
    switch (type) {
        case 'alert':
            return new MyAlert();
        case 'confirm' :
            return new MyConfire();
        case 'someOther': 
            return new someOther();
        default: 
            return ....
    }
}
```
> 简单工厂模式用于集中建造各个类

##### 1.2 用对像代替交叉较多的类

```javascript
function CreatePop (type, content) {
    var obj = new Object();
    obj.content = content;
    obj.show = function () {    // some code  };
    if (type == "alert") {
        
    } 
    if (type == 'confirm') {
        
    }
    ....
    return obj;
}
```
> 这样用一个对像承接该有的方法和属性并返回会比声明一个个类强很多，但是和1.1的区别在于这是批量的产生“类似”的对像，1.1是产生类，如果这些类继承了父类的一些方法，1.2是无法继承的，所以可以根据场景按需使用。

##### 1.3 安全工场
> 安全工厂类似安全的构造函数，在创建对像时校验当前对像是否是是指向当前工厂的，如果是则根据已知参数创建当前对像，否则返回新的工厂。

```javascript
var Factory = function (type, content) {
    if (this instanceof Factory) {
        var s = new this[type](content);
        return s;
    } else {
        return new Factory(type, content);
    }
}

Factory.prototype = {
    // 枚举每个需要创建的构造函数类型
    Java: function (content) {
        // somecode
    },
    Javascript: function (content) {
        // somecode
    },
    ..........
}
```
##### 1.4 抽象工厂模式
> 工厂模式只能对某些特定的情况有作用，比如对一类事物的枚举，他们都差不多，但是假如需要让工厂适用的场景更加广泛，对类簇都起作用呢？那么就是将其核心抽象出来，不在针对某一类产品创建对像。抽象工厂是一种声明但是不能使用的类，当你使用时会报错。

```javascript
var Car = function () {};
Car.prototype = {
    getPrice: function () {
        return new Error('抽象方法不支持调用');
    },
    getSpeed: function () {
        return new Error('抽象方法不支持调用');
    }
};
```
> 上边定义了一个类和两个共有方法，但是每个方法在调用时都会报错，乍一看这特么就是有病，自己给自己报错玩？当然不是。这里这个Car类主要作为基类被子类继承，子类会去重写基类的一些方法，当然这些方法如果在子类中得不到重写就会报错，那么这样写的目的就显而易见了，这些东西用于继承！

```javascript
// 抽象工厂
var VehicleFactory = function (subType, superType) {
    // 判断抽象工厂中是否包含当前抽象类
    if (typeof VehicleFactory[superType] === 'function') {
        // 缓存类,过度类
        function F () {};
        // 继承父类的属性和方法
        F.prototype = new VehicleProtype[superType]();
        // 子类constructor指向子类
        subTyoe.constructor = subType;
        // 子类原型继承父类
        subType.prototype = new F();
    } else {
        throw new Error('抽象类不存在，请创建');
    }
}

// 小汽车抽象类
VehicleFactory.Car = function () {
    this.type = 'car';
};
VehicleFactory.Car.prototype = {
    getPrice: function () {
        return new Error('抽象方法不支持调用');
    },
    getSpeed: function () {
        return new Error('抽象方法不支持调用');
    }
}
// 公交车抽象类
somecode
// 卡车抽象类
somecode

// 创架小汽车父类的子类宝马汽车类
var BMW = function (price, speed) {
    this.price = price || '';
    this.speed = speed || '';
};

// 利用抽象工厂实现BMW对Car类的继承
VehicleFactory('BMW', 'Car');
// 子类原型方法重写
BMW.prototype.getPrice = function () {
    console.log(this.price);
}
```
> 抽象工厂也是工厂，其目的也很简单，就是为了创建一类对像，通过子类重写父类的一些方法实现各自的不同需求，这里有一个独特的地方是抽象类不允许调用要搞清楚，因为抽象类不具有实际意义，它只会按照一定规则批量生产对像，但不关注对像要干什么。

#### 2. 建造者模式
> 建造者模式注重对像创建的过程，关注点在于当前对像创建时会创建哪些属性和方法。以人为例：人会包括姓名、兴趣爱好、工作、专业技能、职位等等，这样就可以将这个人拆开来处理，分别处理这个人的姓名，爱好和工作相关，最后在将之组合为一个人。

```javascript
// 人的构造函数
var Human = function (param) {
    this.skill = param && param.skill || '保密';
    this.hobby = param && param.hobby || '保密';
}

// 人的原型方法
Human.prototype = {
    getSkill: function () {
        return this.skill;
    },
    getHobby: function () {
        return this.hobby;
    }
}
// 实例化姓名类
var Named = function (name) {
    var that = this;
    (function (name, that) {
        that.wholeName = name;
        if (name.indexOf(' ') > -1) {
            that.FirstName = name.slice(0, name.indexOf(' '));
            that.secondName = name.slice(name.indexOf(name.indexOf(' ')));
        }
    })(name, that);
}

// 职位类
var Work = function (work) {
    var that = this;
    (function (work, that) {
        switch (work) {
            case 'code':
                that.work = '工程师';
                that.workDes = '每天沉醉于编程';
                break;
            default:
                that.work = work;
                that.workDes = '尚不明确';
                break;
        }
    })(work, that);
}

// 组装这个人
var Person = function (name, work) {
    // 创建应聘者缓存对像
    var _person = new Human();
    // 创建应聘者姓名解析对像
    _person.name = new Named(name);
    // 创建应聘者期望职位
    _person.work = new Work(work);
    return _person;
}

// 实例化这个人
var person = new Person('xiao ming', 'code');

console.log(person.skill);      // 保密
console.log(person.name.FirstName);        // xiao
console.log(person.work.work);              // 工程师
```
#### 3. 原型模式
> 原型模式有点类似原型链继承，其主要原理也是利用原型链实现子类对基类的继承，实现共有的在基类上，各自的在各自的子类上，分工明确，减少内存消耗。

创建焦点图实例：
```javascript
/* 创建一个焦点图的类 */
var LoopImage = function (imgArr, container) {
    this.imageArr = imageArr;               // 存放图片的数组
    this.container = container;             // 焦点图容器
    this.createImage = function () {};      // 创建一张焦点图
    this.changeImage = function () {};      // 切换下一张焦点图
}

/* 上下滑切换类 */
var slideLoopImg = function (imageArr,container) {
    // 类式继承基类的方法和属性
    LoopImage.call(this, imageArr, container);
    // 重写基类的切换下一张的方法，实现上下滑效果
    this.changeImage = function () {
        // 实现焦点图滑动切换some code
    }
}

/* 渐隐切换类 */
var fadeLoopImg = function (imageArr, container, arrow) {
    // 类式继承基类的方法
    LoopImage.call(this, imageArr, container);
    // 私有变量arrow
    this.arrow = arrow;
    // 重写基类的切换下一张方法，实现渐隐效果
    this.changeImage = function () {
        // 实现焦点图渐隐切换some code
    }
}

/* 实例化一个焦点图 */
var loopImg = new fadeLoopImg([],'slider',[]);
```
> 通过基类实现焦点图的所有需求属性和方法，然后通过子类继承与基类获取所有属性和方法，同时再在子类中扩展或者重写其属性和方法，实现各种各样不同的轮播效果。

上边的方式存在一个很严重的问题，就是不管子类有没有用基类的属性和方法都继承过来了，而且所有的属性和方法定义在基类上，假如有基类有某种耗时操作就会影响整个子类的使用，所以再好一点：

```javascript
/* 创建一个焦点图的类 */
var LoopImage = function (imgArr, container) {
    this.imageArr = imageArr;               // 存放图片的数组
    this.container = container;             // 焦点图容器
}

/* 将一些耗时操作或者复杂操作定义在基类原型上 */
LoopImage.prototype = {
    createImage: function () {
        /* some code */
    },
    changeImage: function () {
        /* some code */
    }
}

/* 上下滑切换类 */
var slideLoopImg = function (imageArr,container) {
    // 类式继承基类的方法和属性
    LoopImage.call(this, imageArr, container);
}
// 子类原型指向基类实例实现继承，共享基类原型上的方法
slideLoopImg.prototype = new LoopImage();
// 重写子类的changeImage方法
slideLoopImg.prototype.changeImage = function () {
    // 实现焦点图滑动切换some code
}

/* 渐隐切换类 */
var fadeLoopImg = function (imageArr, container, arrow) {
    // 类式继承基类的方法
    LoopImage.call(this, imageArr, container);
    // 私有变量arrow
    this.arrow = arrow;
}
// 子类原型指向基类实例实现继承，共享基类原型上的方法
fadeLoopImg.prototype = new LoopImage();
// 重写子类的changeImage方法
fadeLoopImg.prototype.changeImage = function () {
    // 实现焦点图滑动切换some code
}
```
> 当然这里原型对象其实是共享的，无论是在子类还是父类上修改原型对像都会生效，所以这里带来便利的同时也存在风险，修改公用属性或者方法时需要注意对其他子类的影响。

利用原型链的特点实现对像的深浅复制
```javascript
/**** 浅拷贝基于引用类型，不会重新开辟内存；深拷贝需要递归转化成基本类型进行拷贝 ****/
function prototypeExtend () {
    var F = function () {},
        args = arguments,
        i = 0,
        len = args.length;
    for (; i < len; i++) {
        // 遍历传进来的每个对像组成的参数伪数组
        for (var key in len[i]) {
            // 遍历每个对像的属性进行复制
            F.prototype = len[i][key];
        }
    }
    // 返回新的实例，此时F原型上实现对所有对像的属性方法的引用
    return new F ();
}
```
#### 4. 单例模式
> 单例模式是指只允许实例化一次的对像类，使用自调用函数。更多的是规划一个命名空间。

```javascript
// 声明Carlos命名空间，将一些方法挂载在其下边
var Carlos = {
    Unit: {
        unitMethod1: function () {},
        unitMethod2: function () {}
    },
    dom: {
        domOperation1: function () {},
        domOperation2: function () {}
    },
    .....
}
```
> 惰性单例，只有在使用时才会创建，否则不创建，这样就会提高性能，（有点像懒加载？？）

```javascript
var lazySingle = (function () {
    // 单例实例引用
    var instance = null;
    // 单例
    function single () {
        // 私有属性和方法
        return {
            method: function () {},
            prototype: '1111'
        }
    }
    // 获取单例对像
    return function () {
        // 如果单例还未创建则创建单例
        if (!instance) {
            instance = single();
        }
        return instance;
    }
})()
// 调用单例方法
lazySingle().method()
```
> 很明显，lazySingle中返回的实例只有在调用的时候才会声明。

#### 5. 适配器模式
> 适配器模式有以下几种用法：
1. 当前框架适配其他框架
2. 参数适配器
3. 数据适配

### flex  align-item align-content的区别
- 容器属性
  - flex-direction		主轴的方向
  - flex-wrap		主轴一行展示不下，如何换行
  - justify-content	项目在主轴上的对齐方式
  - align-items		项目在交叉轴上的对齐方式
  - align-content		多根轴线如何对齐
- 项目属性
  - order 			项目的排列顺序 越小越靠前 默认0
  - flex-grow		项目的放大比例 
  默认为0 等于0不会放大。大于0，如果有剩余空间的情况下，项目1为x1，项目2为x2，则项目1占剩余空间的x1/(x1+x2)
  - flex-shrink		项目的缩小比例 
  默认为1 等于0不参与缩小。ul width 100px。两个li宽100px，默认每个li都会被缩小1/(1+1)=1/2。第一个li 2，第二个li 3，则第一个li被缩小2/(2+3)=2/5，被缩小的实际宽度为2/5*100=40，剩余宽度为60。第一个li 为0，如果第二个li为0，那么两者都不缩小，第二个li 大于0，那么li实际宽度，第一个li不缩小。
  - flex-basis		项目的占据主轴的空间 默认auto
  - flex-self			该项目单独的对齐方式
****


### 基本类型和引用类型在内存中是如何存储的
- 基本类型存储在栈内存
- 引用类型存储在堆内存 栈内存中存的是引用类型在堆内存中的地址 或者说存的是引用类型的引用
****