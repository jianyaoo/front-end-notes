// 根据Promise/A+规范实现一个Promise


class MyPromise {
  constructor(excutor) {
    this.state = "pending";
    this.value = null;
    // 2.2.6 then may be called multiple times on the same promise.
    // 因为同一个promise的实例可以被调用多次，导致实例在resolve后可以有多个回调，所以这里使用数组记录回调
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    // 1. 每个Promise实例都有自己的状态，且在更改后不能再更改
    // 2. 保证this指针与当前实例一致，使用了闭包且一定会在构造函数内部执行（⭐️⭐️⭐️）
    // 综上两点，所以resolve函数和reject函数需要在构造函数中实现
    const resolve = (value) => {
      // resolve 仅能在pending状态下调用一次
      if (this.state === "pending") {
        // 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
        // onFulfilled 或 onRejected 必须在执行上下文栈仅包含平台代码时调用。也就是在当前Tick的同步代码执行完之后再执行
        queueMicrotask(() => {
          this.state = "fulfilled";
          this.value = value;
          this.onFulfilledCallbacks.forEach((callback) => callback(value));
        }, 0);
      }
    };

    const reject = (reason) => {
      if (this.state === "pending") {
        queueMicrotask(() => {
          this.state = "rejected";
          this.value = reason;
          this.onRejectedCallbacks.forEach((callback) => callback(reason));
        }, 0);
      }
    };

    try {
      excutor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    // 2.2.1 onFulfilled 和 onRejected 都是可选参数,如果未传入则忽略
    // 但是如果不传回调，Promise的结果值要传递给下一个Promise
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const newPromise = new MyPromise((resolve, reject) => {
      const handleFulfilled = (value) => {
        // 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
        // onFulfilled 或 onRejected 必须在执行上下文栈仅包含平台代码时调用。也就是在当前Tick的同步代码执行完之后再执行
        queueMicrotask(() => {
          try {
            const result = onFulfilled(value);
            resolvePromise(newPromise, result, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      };

      const handleRejected = (reason) => {
        // 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
        // onFulfilled 或 onRejected 必须在执行上下文栈仅包含平台代码时调用。也就是在当前Tick的同步代码执行完之后再执行
        queueMicrotask(() => {
          try {
            const result = onRejected(reason);
            resolvePromise(newPromise, result, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      };

      const handlePending = () => {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      };

      const statuasCBS = {
        pending: handlePending,
        fulfilled: handleFulfilled,
        rejected: handleRejected,
      };

      statuasCBS[this.state](this.value);
    });

    return newPromise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // 原始版本
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let results = new Array(promises.length);
      let resultCount = 0;

      for (let i = 0; i < promises.length; i++) {
        const p = promises[i];

        p.then((value) => {
          results[i] = value;
          resultCount++;

          if (resultCount === promises.length) {
            resolve(results);
          }
        }).catch((reason) => {
          reject(reason);
        });
      }
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises.length !== 0) {
        for (let i = 0; i < promises.length; i++) {
          const p = MyPromise.resolve(promises[i]);
          p.then(resolve, reject);
        }
      }
    });
  }

  // 优化1：添加 new AggregateError(errors)，如果所有的promise都失败了，则reject的是每一个promise失败原因组成的数组
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises.length !== 0) {
        let rejectCount = 0;
        const errors = new Array(promises.length);

        for (let i = 0; i < promises.length; i++) {
          const p = MyPromise.resolve(promises[i]);
          p.then(resolve, (reason) => {
            rejectCount++;
            errors[i] = reason;

            if (rejectCount === promises.length) {
              reject(new AggregateError(errors));
            }
          });
        }
      } else {
        reject(new AggregateError("All promises were rejected"));
      }
    });
  }

  static allSettled(promises) {
    if (promises.length === 0) {
      return MyPromise.resolve([]);
    }

    return new MyPromise((resolve, reject) => {
      const results = new Array(promises.length);
      let resultCount = 0;

      for (let i = 0; i < promises.length; i++) {
        const p = MyPromise.resolve(promises[i]);

        p.then((value) => {
          resultCount++;
          results[i] = { status: "fulfilled", value };

          if (resultCount === promises.length) {
            resolve(results);
          }
        }).catch((reason) => {
          resultCount++;
          results[i] = { status: "rejected", reason };

          if (resultCount === promises.length) {
            resolve(results);
          }
        });
      }
    });
  }
  // 优化1：如果一段代码即在then里执行，也在catch中执行。则将该代码放在finally中执行
  static allSettled_2(promises) {
    return new MyPromise((resolve) => {
      if (promises.length === 0) {
        return resolve([]);
      }

      const results = new Array(promises.length);
      let resultCount = 0;

      promises.forEach((p, i) => {
        MyPromise.resolve(p)
          .then((value) => {
            results[i] = { status: "fulfilled", value };
          })
          .catch((reason) => {
            results[i] = { status: "rejected", reason };
          })
          .finally(() => {
            resultCount++;
            if (resultCount === promises.length) {
              resolve(results);
            }
          });
      });
    });
  }

  static allSettled_1(promises) {
    if (promises.length === 0) {
      return Promise.resolve([]);
    }

    const wrappedPromise = promises.map((p) => {
      return MyPromise.resolve(p)
        .then((value) => ({ status: "fulfilled", value }))
        .catch((reason) => ({ status: "rejected", reason }));
    });

    return Promise.all(wrappedPromise);
  }

  // 优化版本
  // 优化1：处理空数组的的情况，如果是空数组，直接resolve
  // 优化2：对非promise进行包装处理
  // 优化3：避免catch逃逸，如果then中的代码出错，应该直接reject【重点是关注代码出错时，是哪个Promise被reject】
  static all_1(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises.length === 0) {
        return resolve([]);
      }

      let results = new Array(promises.length);
      let resultCount = 0;

      for (let i = 0; i < promises.length; i++) {
        const p = MyPromise.resolve(promises[i]);
        p.then((value) => {
          try {
            results[i] = value;
            resultCount++;
            if (resultCount === promises.length) {
              resolve(results);
            }
          } catch (err) {
            reject(err);
          }
        }).catch(reject); // 任何 `Promise` 失败立即 `reject`;
      }
    });
  }

  static deferred() {
    const deferred = {};
    deferred.promise = new MyPromise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  }
}

function resolvePromise(newPromise, result, resolve, reject) {
  // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
  // 一般來說，then返回的是一个新对象，但是并没有明确要求一定返回的是一个新对象，所以为了避免死循环进行了判断
  if (newPromise === result) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }

  //  2.3.2 If x is a promise, adopt its state
  //  如果回调函数返回的是一个Promise，则返回的新的Promise状态与该Promise状态一致
  if (result instanceof MyPromise) {
    // 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
    // 如果返回的Promise是pending状态，则需要等待该Promise状态改变后再改变新的Promise状态
    if (result.state === "pending") {
      result.then(
        (value) => {
          resolvePromise(newPromise, value, resolve, reject);
        },
        (reason) => {
          reject(reason);
        }
      );
    } else {
      // 2.3.2.2 If x is fulfilled, fulfill promise with the same value.
      // 直接去执行then也保证了result的promise也是异步执行的
      result.then(resolve, reject);
    }
    return;
  }

  //  2.3.3 If x is an object or function,
  if (result && (typeof result === "object" || typeof result === "function")) {
    let called = false;
    let then;

    // If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
    // 如果在取x.then属性时抛出了异常，则reject promise
    try {
      then = result.then;
    } catch (err) {
      return reject(err);
    }

    // If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise
    // 如果then是一个函数，则说明该result是一个thenable对象，那返回的Promise状态依赖于thenable对象的状态
    if (typeof then === "function") {
      try {
        then.call(
          result,
          // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
          (value) => {
            // If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
            // 为了满足Promise的状态值只能改变一次的特性，resolve、reject、catch存在竞态条件，只要被执行过则其他的不再执行会被忽略
            if (called) return;
            called = true;
            resolvePromise(newPromise, value, resolve, reject);
          },
          (reason) => {
            if (called) return;
            called = true;
            reject(reason);
          }
        );
      } catch (err) {
        if (called) return;
        called = true;
        reject(err);
      }
    } else {
      resolve(result);
    }
  } else {
    // 2.3.4 If x is not an object or function, fulfill promise with x.
    // 如果x不是一个对象或者函数，则直接resolve
    resolve(result);
  }
}

module.exports = MyPromise;
