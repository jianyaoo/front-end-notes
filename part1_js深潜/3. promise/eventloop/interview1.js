// 题目1
console.log("start1");
setTimeout(() => {
  console.log("setTimeout");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("promise1");
  })
  .then(() => {
    console.log("promise2");
  });

console.log("end1");

// 题目2
console.log("start2")
setTimeout(() => console.log("setTimeout 1"), 0);

Promise.resolve()
  .then(() => {
    console.log("promise1");
    return Promise.resolve();
  })
  .then(() => {
    console.log("promise2");
  })
  .then(() => {
    console.log("promise3");
  });

setTimeout(() => console.log("setTimeout 2"), 0);

// 题目3 => 易错题
console.log("start3");

async function asyncFunc() {
  console.log("asyncFunc start");
  await Promise.resolve();
  console.log("asyncFunc end");
}

asyncFunc();
console.log("end3");

// 题目4 => 易错题
console.log("start4");

async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

async1();

setTimeout(() => {
  console.log("setTimeout");
}, 0);

console.log("end4");

// 题目5 => 易错题
async function foo() {
  console.log("foo start");
  await new Promise((resolve) => {
    console.log("promise1");
    resolve();
  });
  console.log("foo end");
}

console.log("start5");

foo().then(() => console.log("foo then"));

console.log("end5");


// 题目6
console.log("start6");
const fs = require("fs");

fs.readFile(__filename, () => {
  console.log("readFile callback");
});

setTimeout(() => console.log("setTimeout"), 0);
setImmediate(() => console.log("setImmediate"));

// 题目7
console.log("start7");

setTimeout(() => console.log("setTimeout"), 0);
process.nextTick(() => console.log("nextTick"));

console.log("end7");


// 题目8
console.log("start8");

setTimeout(() => console.log("setTimeout"), 0);
queueMicrotask(() => console.log("queueMicrotask"));
Promise.resolve().then(() => console.log("promise.then"));

console.log("end8");
