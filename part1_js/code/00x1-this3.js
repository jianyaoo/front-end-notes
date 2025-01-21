// apply 目的：修改函数的this指针
// --1.对传入的上下文进行校验
// --2.设置self属性时使用Symbol，避免key值重复
Function.prototype.myApply = function (self, arr = []) {
  self.fn = this;
  const res = self.fn(...arr);
  delete self.fn;
  return res;
}

// 细节优化
Function.prototype.myApply2 = function (self, args = []) {
  // 如果没有传入上下文 context，则默认为 `window`（浏览器环境）
  self = self || window;

  const uniqueId = Symbol('fn');
  self[uniqueId] = this;
  const res = self[uniqueId](...args);
  delete self[uniqueId];
  return res;
};

Function.prototype.myCall = function (self, ...args) {
  self = self || window;

  const uniqueId = Symbol('fn');
  self[uniqueId] = this;
  const res = self[uniqueId](...args);
  delete self[uniqueId];
  return res;
}

Function.prototype.myBind = function (self, ...args) {
  const fn = this;

  return function () {
    // const uniqueId = Symbol('fn');
    // self[uniqueId] = fn;
    // const res = self[uniqueId](...args);
    // delete self[uniqueId];
    // return res;

    fn.myApply(self, args)
  }
}


// ===========   test   ==================
function test() {
  console.log(this.name)
}
const name = 'zhangsan'
const obj = {
  name: 'lisi'
}
test.myBind(obj)();

