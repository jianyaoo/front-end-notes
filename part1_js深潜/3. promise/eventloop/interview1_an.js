// 题目1
start1
end1
promise1
promise2
setTimeout

// 题目2
start2
promise1
promise2
promise3
setTimeout 1
setTimeout 2


// 题目3
// 自己的错误结果
start3
asyncFunc start
asyncFunc end
end3
// 实际的输出
// asyncFunc() 同步部分立即执行，打印 "asyncFunc start"。
// await Promise.resolve() 会暂停 asyncFunc() 执行，将后面的代码放入微任务队列。
// console.log("end") 是同步代码，先执行。
// 微任务执行 "asyncFunc end"。
start3
asyncFunc start
end3
asyncFunc end

// 题目4
// 自己的错误结果
start4
async1 start
end4
async2
async1 end
setTimeout
// 实际输出
// async1() 立即执行，打印 "async1 start"。
// async2() 立即执行，打印 "async2"，但它没有 await，不会创建微任务。
// await async2() 不会阻塞后续代码，而是产生一个微任务。
// "end" 是同步代码，先执行。
// 微任务队列执行 "async1 end"。
// setTimeout 是宏任务，最后执行 "setTimeout"。
start
async1 start
async2
end
async1 end
setTimeout


// 题目5
// 自己的错误结果
start5
foo start
promise1
end5
foo then
foo end
// 实际输出
// console.log("start") 立即执行。
// foo() 立即执行，打印 "foo start"。
// await new Promise(resolve => { console.log("promise1"); resolve(); })
// "promise1" 同步执行，所以 "promise1" 先打印。
// resolve() 触发 Promise 进入微任务队列，但 "foo end" 不会立即执行。
// console.log("end") 是同步代码，先执行。
// 微任务执行 "foo end"。
// "foo then" 是 foo().then() 的回调，最后执行。
start
foo start
promise1
end
foo end
foo then


// 题目6
start6
setImmediate
setTimeout
readFile callback

// 题目7
start7
end7
nextTick
setTimeout

// 题目8
start8
end8
queueMicrotask
promise.then
setTimeout