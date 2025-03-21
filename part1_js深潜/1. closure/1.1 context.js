// 执行上下文相关问题
// JavaScript 的赋值表达式的解析顺序和执行机制
// 题目1：
var a = {n:1};
a.x = a = {n:2};
console.log(a.x)


var a1 = undefined;
a1 = {n:1};
a1.x = undefined;
a2 = {n:2};
a1.x = a2;
console.log(a2.x)

// 题目2 ========================
var obj = { a: 1 };
obj.b = obj = { a: 2 };

console.log(obj.a);
console.log(obj.b);

// 2 undefined


// 题目3 =======================
var a = { x: 10 };
var b = a;
b.y = b = { z: 20 };

console.log(a.y); // 输出什么？
console.log(b.y); // 输出什么？

// { z:20 }, undefined


// 题目4 =====================
var a = { x: 1 };
(function(b) {
  b.x = b = { y: 2 };
})(a);

console.log(a.x); // 输出什么？
console.log(a.y); // 输出什么？

// {y:2} undefined
