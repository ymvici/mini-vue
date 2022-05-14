(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var strats = {};
    var LIFECYCLE = ['beforeCreate', 'created'];
    LIFECYCLE.forEach(function (hook) {
      strats[hook] = function (p, c) {
        //  {} {created:function(){}}   => {created:[fn]}
        // {created:[fn]}  {created:function(){}} => {created:[fn,fn]}
        if (c) {
          // 如果儿子有 父亲有   让父亲和儿子拼在一起
          if (p) {
            return p.concat(c);
          } else {
            return [c]; // 儿子有父亲没有 ，则将儿子包装成数组
          }
        } else {
          return p; // 如果儿子没有则用父亲即可
        }
      };
    });
    function mergeOptions(parent, child) {
      var options = {};

      for (var key in parent) {
        // 循环老的  {}
        mergeField(key);
      }

      for (var _key in child) {
        // 循环老的   {a:1}
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }

      function mergeField(key) {
        // 策略模式 用策略模式减少if /else
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          // 如果不在策略中则以儿子为主
          options[key] = child[key] || parent[key]; // 优先采用儿子，在采用父亲
        }
      }

      return options;
    }

    function initGlobalAPI(Vue) {
      // 静态方法
      Vue.options = {};

      Vue.mixin = function (mixin) {
        // 我们期望将用户的选项和 全局的options进行合并 '
        this.options = mergeOptions(this.options, mixin);
        return this;
      };
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字

    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
    // 第一个分组就是属性的key value 就是 分组3/分组4/分组五

    var startTagClose = /^\s*(\/?)>/; // <div> <br/>
    // vue3 采用的不是使用正则
    // 对模板进行编译处理  

    function parseHTML(html) {
      // html最开始肯定是一个  </div>
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 用于存放元素的

      var currentParent; // 指向的是栈中的最后一个

      var root; // 最终需要转化成一颗抽象语法树

      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      } // 利用栈型结构 来构造一颗树


      function start(tag, attrs) {
        var node = createASTElement(tag, attrs); // 创造一个ast节点

        if (!root) {
          // 看一下是否是空树
          root = node; // 如果为空则当前是树的根节点
        }

        if (currentParent) {
          node.parent = currentParent; // 只赋予了parent属性

          currentParent.children.push(node); // 还需要让父亲记住自己
        }

        stack.push(node);
        currentParent = node; // currentParent为栈中的最后一个
      }

      function chars(text) {
        // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g, ' '); // 如果空格超过2就删除2个以上的

        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }

      function end(tag) {
        stack.pop(); // 弹出最后一个, 校验标签是否合法

        currentParent = stack[stack.length - 1];
      }

      function advance(n) {
        html = html.substring(n);
      }

      function parseStartTag() {
        var start = html.match(startTagOpen);

        if (start) {
          var match = {
            tagName: start[1],
            // 标签名
            attrs: []
          };
          advance(start[0].length); // 如果不是开始标签的结束 就一直匹配下去

          var attr, _end;

          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }

          if (_end) {
            advance(_end[0].length);
          }

          return match;
        }

        return false; // 不是开始标签
      }

      while (html) {
        // 如果textEnd 为0 说明是一个开始标签或者结束标签
        // 如果textEnd > 0说明就是文本的结束位置
        var textEnd = html.indexOf('<'); // 如果indexOf中的索引是0 则说明是个标签

        if (textEnd == 0) {
          var startTagMatch = parseStartTag(); // 开始标签的匹配结果

          if (startTagMatch) {
            // 解析到的开始标签
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          var endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }

        if (textEnd > 0) {
          var text = html.substring(0, textEnd); // 文本内容

          if (text) {
            chars(text);
            advance(text.length); // 解析到的文本 
          }
        }
      }

      return root;
    }

    function genProps(attrs) {
      var str = ''; // {name,value}

      for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i];

        if (attr.name === 'style') {
          (function () {
            // color:red;background:red => {color:'red'}
            var obj = {};
            attr.value.split(';').forEach(function (item) {
              // qs 库
              var _item$split = item.split(':'),
                  _item$split2 = _slicedToArray(_item$split, 2),
                  key = _item$split2[0],
                  value = _item$split2[1];

              obj[key] = value;
            });
            attr.value = obj;
          })();
        }

        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d,
      }

      return "{".concat(str.slice(0, -1), "}");
    }

    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量

    function gen(node) {
      if (node.type === 1) {
        return codegen(node);
      } else {
        // 文本
        var text = node.text;

        if (!defaultTagRE.test(text)) {
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          //_v( _s(name)+'hello' + _s(name))
          var tokens = [];
          var match;
          defaultTagRE.lastIndex = 0;
          var lastIndex = 0; // split

          while (match = defaultTagRE.exec(text)) {
            var index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello 

            if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }

            tokens.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          }

          if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }

          return "_v(".concat(tokens.join('+'), ")");
        }
      }
    }

    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }

    function codegen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
      return code;
    }

    function compileToFunction(template) {
      // 1.就是将template 转化成ast语法树
      var ast = parseHTML(template); // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)
      // 模板引擎的实现原理 就是 with  + new Function

      var code = codegen(ast);
      code = "with(this){return ".concat(code, "}");
      var render = new Function(code); // 根据代码生成render函数
      //  _c('div',{id:'app'},_c('div',{style:{color:'red'}},  _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))

      return render;
    } // <xxx
    // <namepsace:xxx
    // color   =   "asdsada"     c= 'asdasd'  d=  asdasdsa

    var id$1 = 0;

    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);

        this.id = id$1++; // 属性的dep要收集watcher

        this.subs = []; // 这里存放着当前属性对应的watcher有哪些
      }

      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // 这里我们不希望放重复的watcher，而且刚才只是一个单向的关系 dep -> watcher
          // watcher 记录dep
          // this.subs.push(Dep.target);
          Dep.target.addDep(this); // 让watcher记住dep
          // dep 和 watcher是一个多对多的关系 （一个属性可以在多个组件中使用 dep -> 多个watcher）
          // 一个组件中由多个属性组成 （一个watcher 对应多个dep）
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            return watcher.update();
          }); // 告诉watcher要更新了
        }
      }]);

      return Dep;
    }();

    Dep.target = null;

    var id = 0; // 1） 当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
    // 2) 调用_render() 会取值 走到get上
    // 每个属性有一个dep （属性就是被观察者） ， watcher就是观察者（属性变化了会通知观察者来更新） -》 观察者模式

    var Watcher = /*#__PURE__*/function () {
      // 不同组件有不同的watcher
      function Watcher(vm, fn, options) {
        _classCallCheck(this, Watcher);

        this.id = id++;
        this.renderWatcher = options; // 是一个渲染watcher

        this.getter = fn; // getter意味着调用这个函数可以发生取值操作

        this.deps = []; // 实现计算属性，和一些清理工作需要用到

        this.depsId = new Set();
        this.get();
      }

      _createClass(Watcher, [{
        key: "addDep",
        value: function addDep(dep) {
          // 一个组件 对应着多个属性 重复的属性也不用记录
          var id = dep.id;

          if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // watcher已经记住了dep了而且去重了，此时让dep也记住watcher
          }
        }
      }, {
        key: "get",
        value: function get() {
          Dep.target = this; // 静态属性就是只有一份

          this.getter(); // 会去vm上取值  vm._update(vm._render)

          Dep.target = null; // 渲染完毕后就清空
        }
      }, {
        key: "update",
        value: function update() {
          queueWatcher(this); // 把当前的watcher 暂存起来
          // this.get(); // 重新渲染
        }
      }, {
        key: "run",
        value: function run() {
          this.get(); // 渲染的时候用的是最新的vm来渲染的
        }
      }]);

      return Watcher;
    }();

    var queue = [];
    var has = {};
    var pending = false; // 防抖

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);
      queue = [];
      has = {};
      pending = false;
      flushQueue.forEach(function (q) {
        return q.run();
      }); // 在刷新的过程中可能还有新的watcher，重新放到queue中
    }

    function queueWatcher(watcher) {
      var id = watcher.id;

      if (!has[id]) {
        queue.push(watcher);
        has[id] = true; // 不管我们的update执行多少次 ，但是最终只执行一轮刷新操作

        if (!pending) {
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }

    var callbacks = [];
    var waiting = false;

    function flushCallbacks() {
      var cbs = callbacks.slice(0);
      waiting = false;
      callbacks = [];
      cbs.forEach(function (cb) {
        return cb();
      }); // 按照顺序依次执行
    } // nextTick 没有直接使用某个api 而是采用优雅降级的方式
    // 内部先采用的是promise （ie不兼容）  MutationObserver(h5的api)  可以考虑ie专享的 setImmediate  setTimeout
    // let timerFunc;
    // if (Promise) {
    //     timerFunc = () => {
    //         Promise.resolve().then(flushCallbacks)
    //     }
    // }else if(MutationObserver){
    //     let observer = new MutationObserver(flushCallbacks); // 这里传入的回调是异步执行的
    //     let textNode = document.createTextNode(1);
    //     observer.observe(textNode,{
    //         characterData:true
    //     });
    //     timerFunc = () => {
    //         textNode.textContent = 2;
    //     }
    // }else if(setImmediate){
    //     timerFunc = () => {
    //        setImmediate(flushCallbacks);
    //     }
    // }else{
    //     timerFunc = () => {
    //         setTimeout(flushCallbacks);
    //      }
    // }


    function nextTick(cb) {
      // 先内部还是先用户的？
      callbacks.push(cb); // 维护nextTick中的cakllback方法

      if (!waiting) {
        // timerFunc()
        Promise.resolve().then(flushCallbacks);
        waiting = true;
      }
    } // 需要给每个属性增加一个dep， 目的就是收集watcher

    // h()  _c()
    function createElementVNode(vm, tag, data) {
      if (data == null) {
        data = {};
      }

      var key = data.key;

      if (key) {
        delete data.key;
      }

      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }

      return vnode(vm, tag, key, data, children);
    } // _v();

    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    } // ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身 (可以描述js css html)
    // 我们的虚拟dom 是描述的dom元素，可以增加一些自定义属性  (描述dom的)

    function vnode(vm, tag, key, data, children, text) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text // ....

      };
    }

    function createElm(vnode) {
      var tag = vnode.tag,
          data = vnode.data,
          children = vnode.children,
          text = vnode.text;

      if (typeof tag === 'string') {
        // 标签
        vnode.el = document.createElement(tag); // 这里将真实节点和虚拟节点对应起来，后续如果修改属性了

        patchProps(vnode.el, data);
        children.forEach(function (child) {
          vnode.el.appendChild(createElm(child));
        });
      } else {
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    }

    function patchProps(el, props) {
      for (var key in props) {
        if (key === 'style') {
          // style{color:'red'}
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(key, props[key]);
        }
      }
    }

    function patch(oldVNode, vnode) {
      // 写的是初渲染流程 
      var isRealElement = oldVNode.nodeType;

      if (isRealElement) {
        var elm = oldVNode; // 获取真实元素

        var parentElm = elm.parentNode; // 拿到父元素

        var newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm); // 删除老节点

        return newElm;
      }
    }

    function initLifeCycle(Vue) {
      Vue.prototype._update = function (vnode) {
        // 将vnode转化成真实dom
        var vm = this;
        var el = vm.$el; // patch既有初始化的功能  又有更新 

        vm.$el = patch(el, vnode);
      }; // _c('div',{},...children)


      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      }; // _v(text)


      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      Vue.prototype._s = function (value) {
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };

      Vue.prototype._render = function () {
        // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
        return this.$options.render.call(this); // 通过ast语法转义后生成的render方法
      };
    }
    function mountComponent(vm, el) {
      // 这里的el 是通过querySelector处理过的
      vm.$el = el; // 1.调用render方法产生虚拟节点 虚拟DOM

      var updateComponent = function updateComponent() {
        vm._update(vm._render()); // vm.$options.render() 虚拟节点

      };

      var watcher = new Watcher(vm, updateComponent, true); // true用于标识是一个渲染watcher

      console.log(watcher); // 2.根据虚拟DOM产生真实DOM 
      // 3.插入到el元素中
    } // vue核心流程 1） 创造了响应式数据  2） 模板转换成ast语法树  
    // 3) 将ast语法树转换了render函数 4) 后续每次数据更新可以只执行render函数 (无需再次执行ast转化的过程)
    // render函数会去产生虚拟节点（使用响应式数据）
    // 根据生成的虚拟节点创造真实的DOM

    function callHook(vm, hook) {
      // 调用钩子函数
      var handlers = vm.$options[hook];

      if (handlers) {
        handlers.forEach(function (handler) {
          return handler.call(vm);
        });
      }
    }

    // 我们希望重写数组中的部分方法
    var oldArrayProto = Array.prototype; // 获取数组的原型
    // newArrayProto.__proto__  = oldArrayProto

    var newArrayProto = Object.create(oldArrayProto);
    var methods = [// 找到所有的变异方法
    'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // concat slice 都不会改变原数组

    methods.forEach(function (method) {
      // arr.push(1,2,3)
      newArrayProto[method] = function () {
        var _oldArrayProto$method;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        // 这里重写了数组的方法
        // push.call(arr)
        // todo...
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法 ， 函数的劫持  切片编程
        // 我们需要对新增的 数据再次进行劫持


        var inserted;
        var ob = this.__ob__;

        switch (method) {
          case 'push':
          case 'unshift':
            // arr.unshift(1,2,3)
            inserted = args;
            break;

          case 'splice':
            // arr.splice(0,1,{a:1},{a:1})
            inserted = args.slice(2);
        } // console.log(inserted); // 新增的内容


        if (inserted) {
          // 对新增的内容再次进行观测  
          ob.observeArray(inserted);
        }

        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);

        // 给每个对象都增加收集功能 
        this.dep = new Dep(); // 所有对象都要增加dep
        // Object.defineProperty只能劫持已经存在的属性 （vue里面会为此单独写一些api  $set $delete）

        Object.defineProperty(data, '__ob__', {
          value: this,
          enumerable: false // 将__ob__ 变成不可枚举 （循环的时候无法获取到）

        }); // data.__ob__ = this; // 给数据加了一个标识 如果数据上有__ob__ 则说明这个属性被观测过了

        if (Array.isArray(data)) {
          // 这里我们可以重写数组中的方法 7个变异方法 是可以修改数组本身的
          data.__proto__ = newArrayProto; // 需要保留数组原有的特性，并且可以重写部分方法

          this.observeArray(data); // 如果数组中放的是对象 可以监控到对象的变化
        } else {
          this.walk(data);
        }
      }

      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          // 循环对象 对属性依次劫持
          // "重新定义"属性   性能差
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          // 观测数组
          data.forEach(function (item) {
            return observe(item);
          });
        }
      }]);

      return Observer;
    }(); // 深层次嵌套会递归，递归多了性能差，不存在属性监控不到，存在的属性要重写方法  vue3-> proxy


    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];
        current.__ob__ && current.__ob__.dep.depend();

        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }

    function defineReactive(target, key, value) {
      // 闭包  属性劫持
      var childOb = observe(value); // 对所有的对象都进行属性劫持  childOb.dep 用来收集依赖的

      var dep = new Dep(); // 每一个属性都有一个dep

      Object.defineProperty(target, key, {
        get: function get() {
          // 取值的时候 会执行get
          if (Dep.target) {
            dep.depend(); // 让这个属性的收集器记住当前的watcher

            if (childOb) {
              childOb.dep.depend(); // 让数组和对象本身也实现依赖收集

              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }

          return value;
        },
        set: function set(newValue) {
          // 修改的时候 会执行set
          if (newValue === value) return;
          observe(newValue);
          value = newValue;
          dep.notify(); // 通知更新
        }
      });
    }
    function observe(data) {
      // 对这个对象进行劫持
      if (_typeof(data) !== 'object' || data == null) {
        return; // 只对对象进行劫持
      }

      if (data.__ob__ instanceof Observer) {
        // 说明这个对象被代理过了
        return data.__ob__;
      } // 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过)


      return new Observer(data);
    }

    function initState(vm) {
      var opts = vm.$options; // 获取所有的选项

      if (opts.data) {
        initData(vm);
      }
    }

    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        // vm.name
        get: function get() {
          return vm[target][key]; // vm._data.name
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }

    function initData(vm) {
      var data = vm.$options.data; // data可能是函数和对象

      data = typeof data === 'function' ? data.call(vm) : data; // data是用户返回的对象

      vm._data = data; // 我将返回的对象放到了_data上
      // 对数据进行劫持 vue2 里采用了一个api defineProperty

      observe(data); // 将vm._data 用vm来代理就可以了 

      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }

    function initMixin(Vue) {
      // 就是给Vue增加init方法的
      Vue.prototype._init = function (options) {
        // 用于初始化操作
        // vue  vm.$options 就是获取用户的配置 
        // 我们使用的 vue的时候 $nextTick $data $attr.....
        var vm = this; // 我们定义的全局指令和过滤器.... 都会挂载到实力上

        vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂载到实例上

        callHook(vm, 'beforeCreate'); // 内部调用的是beforeCreate 写错了就不执行了
        // 初始化状态

        initState(vm);
        callHook(vm, 'created');

        if (options.el) {
          vm.$mount(options.el); // 实现数据的挂载
        }
      };

      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        var ops = vm.$options;

        if (!ops.render) {
          // 先进行查找有没有render函数 
          var template; // 没有render看一下是否写了tempate, 没写template采用外部的template

          if (!ops.template && el) {
            // 没有写模板 但是写了el
            template = el.outerHTML;
          } else {
            if (el) {
              template = ops.template; // 如果有el 则采用模板的内容
            }
          } // 写了temlate 就用 写了的template


          if (template && el) {
            // 这里需要对模板进行编译 
            var render = compileToFunction(template);
            ops.render = render; // jsx 最终会被编译成h('xxx')
          }
        }

        mountComponent(vm, el); // 组件的挂载  
        // 最终就可以获取render方法
        // script 标签引用的vue.global.js 这个编译过程是在浏览器运行的
        // runtime是不包含模板编译的, 整个编译是打包的时候通过loader来转义.vue文件的, 用runtime的时候不能使用template
      };
    }

    function Vue(options) {
      // options就是用户的选项
      this._init(options); // 默认就调用了init

    }

    Vue.prototype.$nextTick = nextTick;
    initMixin(Vue); // 扩展了init方法

    initLifeCycle(Vue);
    initGlobalAPI(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
