// 题目一：Promise并发池,并行控制，实现一个函数 runParallel(promises, limit)，要求如下：
//  接收一个数组 promises，数组元素是返回Promise的函数（非Promise本身）。
//  限制同时执行的Promise数量不超过 limit。
//  所有Promise执行完毕后，按输入顺序返回结果数组。
//  需处理单个Promise失败的情况，整体返回的Promise不reject，结果数组中用 { status: 'rejected', reason: Error } 和 { status: 'fulfilled', value: any } 表示成功/失败。
//  调用示例：runParallel(testPromisesWithFailure, 2).then(console.log);

// 初次实现
async function runParallel_self(promises, limit) {
    const results = [];
    const executing = [];
  
    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i];
      executing.push(promise());
  
      if (executing.length >= limit || i === promises.length - 1) {
        // Notes：容易引起任务堆积，且时间消耗时长为所有任务中最长的时间长度
        const p = await Promise.allSettled(executing);
        results.push(...p);
        executing.length = 0;
      }
    }
  
    return results;
  }

// 方案1：使用单层循环
// 实现的思路是：指定个数并发，当其中一个promise执行完毕后，就继续执行下一个promise
// 卡点1. 如何只监听1个Promise完成
// 卡点2：某个Promise完成后，如何把它从并发池中删掉
// 知识1：如果想要一个指定格式或者指定行为的Promise，可以对当前Promise透传或者和指定行为竞态
// 知识2：在Promise.all中，如果一个promise失败但是他有自己的catch，那么对于all来说这个promise的状态是fulfilled，因为catch也是返回一个Promise
async function runParallel_1(promises, limit) {
    const results = new Array(promises.length);  // 按需接受所有的返回结果
    const executing = new Set(); // 执行池

    for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]();

        // 对promise进行了一次包装，返回指定格式的结果，当promise状态发生改变时，wrappedPromise的状态值也会立刻变化
        const wrappedPromise = promise
            .then(value => ({ status: "fulfilled", value }))
            // Notes：因为在这里为单个Promise添加了catch，所以在Promise.all中，该Promise的状态是fulfilled
            .catch(error => ({ status: "rejected", reason: error }));

        results[i] = wrappedPromise;
        executing.add(wrappedPromise);
        if (executing.size >= limit) {
            await Promise.race(executing);
        }

        // 将已经执行结束的从执行池中删除
        executing.forEach(p => p.then(() => executing.delete(p)));
    }

    return Promise.all(results);
}

// 方案2：递归实现
// 知识1：while
async function runParallel_2(promises, limit) {
    const results = new Array(promises.length);  // 按需接受所有的返回结果
    let index = 0;  // 记录当前要执行的任务索引，因为没有用forEach，所以需要手动记录索引
    let activeCount = 0;  // 记录当前正在执行的任务数

    return new Promise((resolve) => {
        const next = () => {
            // 如果所有任务执行完毕，则 resolve 结果
            if (index >= promises.length && activeCount === 0) {
                return resolve(results);
            }

            // 启动新的 Promise，直到达到 limit
            while (activeCount < limit && index < promises.length) {
                const currentIndex = index; // 记录当前任务索引，保证结果顺序
                const promiseFunc = promises[index++]; // 取出当前 Promise 生成函数
                activeCount++; // 增加正在执行的任务数

                // 执行 Promise
                promiseFunc()
                    .then(value => {
                        results[currentIndex] = { status: "fulfilled", value };
                    })
                    .catch(error => {
                        results[currentIndex] = { status: "rejected", reason: error };
                    })
                    .finally(() => {
                        activeCount--; // 任务完成，减少执行数
                        next(); // 继续执行下一个任务
                    });
            }
        };

        next(); // 启动任务调度
    });
}


/***=======================================================以下为测试用例====================================================***/ 
// 测试用例1 - 测试失败的任务
function delayWithFailure(value, time, shouldReject = false) {
    return () =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                shouldReject ? reject(new Error(value)) : resolve(value);
            }, time);
        });
}
const testPromisesWithFailure = [
    delayWithFailure("Task 1", 500),
    delayWithFailure("Task 2 Failed", 300, true),
    delayWithFailure("Task 3", 700),
    delayWithFailure("Task 4 Failed", 200, true),
    delayWithFailure("Task 5", 600)
];

runParallel_1(testPromisesWithFailure, 2).then(console.log);

