import { observe } from "./observe/index";

// 对数据进行劫持
export function initState(vm) {
  const opts = vm.$options; // 获取所有的选项，组件上传入的数据
  if (opts.data) {
    initData(vm);
  }
}
function proxy(vm, target, key) {
  // 使用 Object.defineProperty添加方法，当调用到vm.key时，会被转发到vm._data[key]上
  Object.defineProperty(vm, key, {
    // 当使用vm.name取值name时，会被代理到vm._data.name上
    get() {
      return vm[target][key]; // vm._data.name
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}
function initData(vm) {
  let data = vm.$options.data; // data可能是函数和对象，vue3认定data是函数
  data = typeof data === "function" ? data.call(vm) : data; // data是用户返回的对象，为了让this仍然指向vue实例
  console.log("~ data", data);

  vm._data = data; // 我将返回的对象放到了_data上
  // 对数据进行劫持 vue2 里采用了一个api
  observe(data);
  console.log("~observe data", data);

  // 将vm._data 用vm来代理就可以了
  for (let key in data) {
    // 将所有劫持的属性转发到vm上
    proxy(vm, "_data", key);
  }
}
