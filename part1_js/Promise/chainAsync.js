// 题目二：异步任务链式调用，异步任务链式依赖
// 实现一个函数 chainAsync(tasks)，要求如下：
// 1. 接收一个任务数组 tasks，每个任务是一个函数，接收前一个任务的输出，返回Promise。
// 2. 按顺序依次执行任务，前一个任务的结果作为下一个任务的输入。
// 3. 若某个任务失败，则整个链立即终止，返回失败的Promise。
// 4. 最终返回最后一个任务的结果。

// 首次实现
// 卡点1：在for循环中，某个Promise被reject后，如何终止for循环？
// 卡点2：如何在for循环中，捕获到Promise被reject的错误？
// 知识1：await后面不要跟then，直接跟Promise即可
async function chainAsync(takes, initData){
    let result = initData;
    let isReject = false;

    for (let i = 0; i < takes.length; i++) {
        if (isReject) {
            break;
        }

        const p = takes[i];

        await p(result).then(rsp => {
            result = rsp;
        }, err => {
            isReject = true;
            throw new Error(err);
        });
    }

    return new Promise((resolve, reject) => {
        if (isReject) {
            reject(result);
        } else {
            resolve(result);
        }
    });
}

// 知识1：对于异常，可以使用try catch捕获，不用为每个Promise单独设置
// 知识2：如果想要终止for循环，直接使用return即可
async function chainAsync_1(tasks) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return Promise.reject(new Error("Invalid tasks array"));
    }

    let result;
    for (const task of tasks) {
        try {
            result = await task(result);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    return result;
}

/*********************************** 以下为测试用例 ***************************************/
chainAsync([
    (input) => Promise.resolve(input + 1), // input初始为undefined
    (res) => Promise.resolve(res * 2),
    (res) => Promise.resolve(res + 3),
  ], 1).then(
    (finalResult) => {
      console.log(finalResult); // 输出：NaN（初始undefined+1=NaN，后续运算结果）
    },
    (error) => {
      console.log(error);
    }
  );
  