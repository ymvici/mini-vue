import { newArrayProto } from "./array";

class Observer {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性 （vue里面会为此单独写一些api  $set $delete）
    Object.defineProperty(data, "__ob__", {
      // 给劫持的数据添加ob原型，使其他地方可以调用observer上的方法
      value: this,
      enumerable: false, // 将__ob__ 变成不可枚举 （循环的时候无法获取到），为了在对象递归的时候不陷入死循环
    });
    // data.__ob__ = this; // 给数据加了一个标识 如果数据上有__ob__ 则说明这个属性被观测过了
    if (Array.isArray(data)) {
      // 这里我们可以重写数组中的方法 7个变异方法 是可以修改数组本身的
      // 用于监听七个改变数组的api 需要保留数组原有的特性，并且可以重写部分方法
      // 修改数组数据的原型
      data.__proto__ = newArrayProto;
      this.observeArray(data); // 如果数组中放的是对象 可以监控到对象的变化，不是对象的数据不进行劫持
    } else {
      this.walk(data);
    }
  }
  // 3.1 循环对象 对属性依次劫持
  walk(data) {
    // "重新定义"属性   性能差
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    // 观测数组
    data.forEach((item) => observe(item));
  }
}
// 3.2将属性定义成响应式的
export function defineReactive(target, key, value) {
  // 劫持对象嵌套的对象
  observe(value);
  // 对所有的对象都进行属性劫持
  Object.defineProperty(target, key, {
    get() {
      // 取值的时候 会执行get
      console.log("取值key", key);
      return value;
    },
    set(newValue) {
      // 修改的时候 会执行set
      console.log("修改key", newValue);
      if (newValue === value) return;
      observe(newValue);
      value = newValue;
    },
  });
}
export function observe(data) {
  // 1.对这个对象进行劫持
  if (typeof data !== "object" || data == null) {
    return; // 只对对象进行劫持
  }
  // 2 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过)
  if (data.__ob__ instanceof Observer) {
    // 说明这个对象被代理过了
    return data.__ob__;
  }
  // 3. 使用实例来劫持对象
  return new Observer(data);
}
