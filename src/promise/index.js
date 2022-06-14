/*
 * @Author: vici_y vici_y@163.com
 * @Date: 2022-06-05 17:22:03
 * @LastEditors: vici_y vici_y@163.com
 * @LastEditTime: 2022-06-14 10:23:45
 * @FilePath: \mini-vue\src\promise\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
class HD {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    console.log("~ executor", executor);
    this.status = HD.PENDING;
    this.value = null;
    // 当执行体中出现错误需要捕捉
    try {
      // 这里的this指向的window，需要认为改变指向
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    console.log("~ value", value);
    // 只有准备状态才能改变
    if (this.status === HD.PENDING) {
      this.status = HD.FULFILLED;
      this.value = value;
    }
  }
  reject(reason) {
    if (this.status === HD.PENDING) {
      this.status = HD.REJECTED;
      this.value = reason;
    }
  }
  then(onFulfilled, onRejected) {
    // 当不传resolve或者reject函数时，会自动封装成函数
    if (typeof onFulfilled != "function") {
      onFulfilled = () => {};
      // onFulfilled = () => this.value;
    }
    if (typeof onRejected != "function") {
      onRejected = () => {};
      // onRejected = () => this.value;
    }
    let promise = new HD((resolve, reject) => {
      // 当状态改变后才会执行对应函数
      // if (this.status == HD.PENDING) {
      //   this.callbacks.push({
      //     onFulfilled: (value) => {
      //       this.parse(promise, onFulfilled(value), resolve, reject);
      //     },
      //     onRejected: (value) => {
      //       this.parse(promise, onRejected(value), resolve, reject);
      //     },
      //   });
      // }
      if (this.status == HD.FULFILLED) {
        onFulfilled(this.value);
        // setTimeout(() => {
        //   this.parse(promise, onFulfilled(this.value), resolve, reject);
        // });
      }
      if (this.status == HD.REJECTED) {
        onRejected(this.value);
        // setTimeout(() => {
        //   this.parse(promise, onRejected(this.value), resolve, reject);
        // });
      }
    });
    return promise;
  }
}
