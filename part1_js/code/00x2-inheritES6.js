// 类声明
// ======================== ES5 调用 =============================
function Person_new(){
  console.log('person ctor myNew');
}
function Vegetable_new(){
  this.color = 'orange myNew';
}
function myNew(Fn, args = []) {
  let obj = {};
  obj.__proto__ = Fn.prototype;
  const res = Fn.apply(obj, args);
  if (res) return res;
  return obj;
}
let a1 = myNew(Person_new);
let b1 = myNew(Vegetable_new)
console.log(b1.color)

// ======================== ES6 调用 =============================
class Animal {}
class Person {
  constructor() {
    console.log('person ctor');
  }
}
class Vegetable {
  constructor() {
    this.color = 'orange';
  }
}
let a = new Animal();
let p = new Person(); // person ctor
let v = new Vegetable();
console.log(v.color); // orange


console.log(typeof Person)


// ======================== 实例、原型和方法 =============================
class Person_2 {
  constructor() {
    // 添加到 this 的所有内容都会存在于不同的实例上
    this.locate = () => console.log('instance');
  }

  // 在类块中定义的所有内容都会定义在类的原型上
  locate() {
    console.log('prototype');
  }
}

let p2 = new Person_2();
p2.locate(); // instance
Person_2.prototype.locate(); // prototype


// 类继承
class Parent {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(`Hello, I am ${this.name}`);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name); // 调用父类的构造函数
    this.age = age;
  }

  greet() {
    super.greet(); // 调用父类的方法
    console.log(`I am ${this.age} years old`);
  }
}

const child = new Child("Alice", 10);
child.greet();
// 输出：
// Hello, I am Alice
// I am 10 years old



