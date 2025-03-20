// 题目三：可取消的Promise包装器
// 实现一个高阶函数 makeCancelable(promise)，要求：
//  1. 返回一个对象，包含 promise 属性和 cancel() 方法。
//  2. 调用 cancel() 后，包装的Promise应立即reject，并阻止原Promise的后续then/catch执行。
//  3. 若原Promise在cancel前已完成，则cancel无效。

// 初次版本
// 知识1：如何监并响应promise的状态改变
function makeCancelable(promise) {
  let cancel;
  const wrapperPromise = Promise.race([
    promise,
    new Promise((_, reject) => {
      cancel = () => {
        reject(new Error("Promise was canceled"));
      };
    }),
  ]);

  return {
    promise: wrapperPromise,
    cancel,
  };
}

// 优化版本
// 优化1：cancel 变量未防止多次调用，同一个Promise应该只能被cancel一次
// 优化2：Promise.race只是对状态的监听，无法阻止原Promise的后续then/catch执行，需要在原Promise上进行监听判断
function makeCancelable(promise) {
  let isCanceled = false;
  let cancel;

  const cancelPromise = new Promise((_, reject) => {
    cancel = () => {
      if (!isCanceled) {
        isCanceled = true;
        reject(new Error("Promise was canceled"));
      }
    };
  });

  const wrappedPromise = new Promise((resolve, reject) => {
    promise
      .then((value) => {
        if (isCanceled) {
          reject(new Error("Promise was canceled"));
        } else {
          resolve(value);
        }
      })
      .catch((error) => {
        if (isCanceled) {
          reject(new Error("Promise was canceled"));
        } else {
          reject(error);
        }
      });

    Promise.race([promise, cancelPromise]).catch(reject);
  });

  return {
    promise: wrappedPromise,
    cancel,
  };
}

/*********************************** 以下为测试用例 ***************************************/
const delayedPromise = new Promise((resolve) => {
  setTimeout(() => resolve("Task Complete!"), 1000);
});
const cancelable = makeCancelable(delayedPromise);

cancelable.promise
  .then((value) => console.log("Success:", value))
  .catch((error) => console.log("Error:", error.message));

setTimeout(() => {
  cancelable.cancel(); // 2 秒后取消
}, 2000);
