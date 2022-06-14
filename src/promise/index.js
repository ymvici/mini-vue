/*
 * @Author: vici_y vici_y@163.com
 * @Date: 2022-06-05 17:22:03
 * @LastEditors: vici_y vici_y@163.com
 * @LastEditTime: 2022-06-14 10:13:31
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
}
