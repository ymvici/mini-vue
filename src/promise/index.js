/*
 * @Author: vici_y vici_y@163.com
 * @Date: 2022-06-05 17:22:03
 * @LastEditors: vici_y vici_y@163.com
 * @LastEditTime: 2022-06-14 11:31:49
 * @FilePath: \mini-vue\src\promise\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
class HD {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    console.log("构造函数 executor", executor);
    this.status = HD.PENDING;
    this.value = null;
    this.callbacks = []; // 存放需要执行的函数，在异步状态改变后执行数组中函数
    // 当执行体中出现错误需要捕捉
    try {
      // 这里的this指向的window，需要认为改变指向
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    // 只有准备状态才能改变
    if (this.status === HD.PENDING) {
      this.status = HD.FULFILLED;
      this.value = value;
      // this.callbacks.map((callback) => {
      //   callback.onFulfilled(value);
      // });
      // 因为then产生的也是异步任务，所以不能立即执行
      setTimeout(() => {
        this.callbacks.map((callback) => {
          callback.onFulfilled(value);
        });
      });
    }
  }
  reject(reason) {
    if (this.status === HD.PENDING) {
      this.status = HD.REJECTED;
      this.value = reason;
      setTimeout(() => {
        this.callbacks.map((callback) => {
          callback.onRejected(reason);
        });
      });
    }
  }
  then(onFulfilled, onRejected) {
    // 当不传resolve或者reject函数时，会自动封装成函数
    if (typeof onFulfilled != "function") {
      // onFulfilled = () => {};
      // 实现链式调用的时候穿透调用
      onFulfilled = () => this.value;
    }
    if (typeof onRejected != "function") {
      // onRejected = () => {};
      onRejected = () => this.value;
    }
    // then返回的时promise，上一步返回的promie状态不会影响新的promise
    let promise = new HD((resolve, reject) => {
      // 当promise体中存在异步调用时，将需要执行的函数存入数组，等待状态改变后执行
      if (this.status == HD.PENDING) {
        this.callbacks.push({
          onFulfilled: (value) => {
            this.parse(promise, onFulfilled(value), resolve, reject);
          },
          onRejected: (value) => {
            this.parse(promise, onRejected(value), resolve, reject);
          },
        });
      }
      // 当状态改变后才会执行对应函数
      if (this.status == HD.FULFILLED) {
        // 模拟异步任务
        setTimeout(() => {
          this.parse(promise, onFulfilled(this.value), resolve, reject);
        });
      }
      if (this.status == HD.REJECTED) {
        // 模拟异步任务
        setTimeout(() => {
          this.parse(promise, onRejected(this.value), resolve, reject);
        });
      }
    });
    return promise;
  }
  parse(promise, result, resolve, reject) {
    console.log("~ promise", promise);
    if (promise == result) {
      throw new TypeError("Chaining cycle detected");
    }
    try {
      // 判断函数体内返回的时promise还是普通的值
      if (result instanceof HD) {
        result.then(resolve, reject);
      } else {
        // 链式调用的新的promise默认返回成功的
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  }
}
