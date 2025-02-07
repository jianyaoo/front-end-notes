//  代码验证原型链
function Parent() {
  this.name = "Parent";
}
Parent.prototype.sayHello = function () {
  console.log("Hello from Parent");
};

function Child() {
  this.age = 10;
}
Child.prototype = new Parent();
const child = new Child();

console.log(child.name); // ? Parent
console.log(child.age); // ? 10
child.sayHello(); // ? Hello from Parent
console.log(child.__proto__ === Parent.prototype); // ? false
console.log(child.__proto__.__proto__ === Object.prototype); // ? false
console.log(child.__proto__.__proto__.__proto__); // ? Object
console.log(child.__proto__.__proto__.__proto__.__proto__); // ? null


//  构造函数与原型的关系
function Person() {}
const p1 = new Person();

console.log(Person.prototype === p1.__proto__); // ? true
console.log(Person.__proto__ === Function.prototype); // ? true
console.log(Function.prototype.__proto__ === Object.prototype); // ? true
console.log(Object.prototype.__proto__); // ? null


// 修改原型的影响
function Animal() {}
Animal.prototype.eat = function () {
  console.log("Eating");
};

const dog = new Animal();
Animal.prototype = {
  bark: function () {
    console.log("Barking");
  }
};

// console.log(dog.eat()); // ? error
// console.log(dog.bark()); // ? dog.bark is not a function

// 5. Object.create 的用法与继承
const parent = {
  name: "Parent",
  greet: function () {
    console.log(`Hello, I am ${this.name}`);
  }
};

const child2 = Object.create(parent);
child2.name = "Child";

child2.greet(); // ? Hello, I am Child
console.log(child2.__proto__ === parent); // ? true
console.log(Object.getPrototypeOf(child2) === parent); // ? true

// 原型链中的方法查找顺序
function Parent2() {
  this.sayHello = function () {
    console.log("Hello from instance");
  };
}
Parent2.prototype.sayHello = function () {
  console.log("Hello from prototype");
};

const p = new Parent2();
p.sayHello(); // ? Hello from instance

delete p.sayHello;
p.sayHello(); // ? Hello from prototype


// 判断以下代码输出
function A() {}
function B() {}

A.prototype = {
  sayHi: function () {
    console.log("Hi from A");
  }
};

B.prototype = new A();
B.prototype.sayHi = function () {
  console.log("Hi from B");
};

const b = new B();
b.sayHi(); // ? Hi from B
delete b.sayHi;
b.sayHi(); // ? Hi from B


// 多层继承查找
function Grandparent() {}
Grandparent.prototype.greet = function () {
  console.log("Hello from Grandparent");
};

function Parent3() {}
Parent3.prototype = new Grandparent();
Parent3.prototype.greet = function () {
  console.log("Hello from Parent");
};

function Child3() {}
Child3.prototype = new Parent3();

const child3 = new Child3();
child3.greet(); // ? Hello from Parent
delete Child3.prototype.greet;
child3.greet(); // ? Hello from Parent


// 原型链的终点
const obj = {};
console.log(obj.__proto__ === Object.prototype); // ? true
console.log(Object.prototype.__proto__); // ? null
console.log(Function.prototype.__proto__ === Object.prototype); // ? true
console.log(Function.prototype.constructor === Function); // ? true

// 解释代码执行
function Person4() {}
const p4 = new Person4();
Person4.prototype = { constructor: Person4 };

console.log(p4.constructor === Person4); // ? true
console.log(p4.__proto__.constructor === Person4); // ? true
console.log(p4.__proto__ === Person4.prototype); // ? false





