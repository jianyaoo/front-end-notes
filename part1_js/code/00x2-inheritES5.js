// 原型继承
function SuperType() {
  this.property = true;
}
SuperType.prototype.getSuperValue = function() {
  return this.property;
};

function SubType() {
  this.subproperty = false;
}
// 继承 SuperType
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function () {
  return this.subproperty;
};
let instance = new SubType();
console.log(instance.getSuperValue());



//  原型继承 -> 把父类实例放在子类的原型上，所以子类可以访问父类的实例属性和原型属性
function SuperType1() {
  this.colors = ["red", "blue", "green"];
}
function SubType1() {}
// 继承 SuperType1
// superType1的实例属性变成了原型属性，这样SubType1的所有实例都可以访问superType1的实例属性
// 如果某个实例改变了属性值，则所有实例中的原型值都变了
SubType1.prototype = new SuperType1();

let instance1 = new SubType1();
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"

let instance2 = new SubType1();
console.log(instance2.colors); // "red,blue,green,black"


// 经典原型继承 -> 把父类属性放在子类的构造函数中/实现中，父类中的this被绑定到了子类实例上
// ！！！但是，只能绑定父类的实例属性，不能使用父类原型上的属性
function SuperType2() {
  this.colors = ["red", "blue", "green"];
}
function SubType2() {
  SuperType2.call(this);
}
let instance1_2 = new SubType2();
instance1_2.colors.push("black");
console.log(instance1_2.colors); // "red,blue,green,black"
let instance2_2 = new SubType2();
console.log(instance2_2.colors); // "red,blue,green"


// 组合继承（伪经典继承）-> 实现继承实现（实现继承属性），原型继承原型（原型继承函数）
// 使用最多的继承方式，但是存在效率问题：调用了两次父类构造函数！存在多余的实例对象
function SuperType3(name){
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType3.prototype.sayName = function() {
  console.log(this.name);
};
function SubType3(name, age){
  // 继承属性
  SuperType3.call(this, name);
  this.age = age;
}
// 继承方法
SubType3.prototype = new SuperType3();
SubType3.prototype.sayAge = function() {
  console.log(this.age);
};

let instance1_3 = new SubType3("Nicholas", 29);
instance1_3.colors.push("black");
console.log(instance1_3.colors); // "red,blue,green,black"
instance1_3.sayName(); // "Nicholas";
instance1_3.sayAge(); // 29
let instance2_3 = new SubType("Greg", 27);
console.log(instance2_3.colors); // "red,blue,green"
instance2_3.sayName(); // "Greg";
instance2_3.sayAge();


// 原型式继承 -> 原型式继承非常适合不需要单独创建构造函数，但仍然需要在对象间共享信息的场合。
let person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"]
};

function object(o) {
  function F() {
  }

  F.prototype = o;
  return new F();
}

let anotherPerson = object(person);
anotherPerson.name = "Greg";
anotherPerson.friends.push("Rob");
let yetAnotherPerson = object(person);
yetAnotherPerson.name = "Linda";
yetAnotherPerson.friends.push("Barbie");
console.log(person.friends); // "Shelby,Court,Van,Rob,Barbie"

// 规范中的原型式继承
let anotherPerson1 = Object.create(person);
anotherPerson1.name = "Greg";
anotherPerson1.friends.push("Rob");
let yetAnotherPerson2 = Object.create(person);
yetAnotherPerson2.name = "Linda";
yetAnotherPerson2.friends.push("Barbie");
console.log(person.friends); // "Shelby,Court,Van,Rob,Barbie"


// 寄生式继承 => 寄生式继承同样适合主要关注对象，而不在乎类型和构造函数的场景。

function createAnother(original){
  let clone = object(original); // 通过调用函数创建一个新对象
  clone.sayHi = function() { // 以某种方式增强这个对象
    console.log("hi");
  };
  return clone; // 返回这个对象
}
let anotherPerson2 = createAnother(person);
anotherPerson2.sayHi(); // "hi"


// 寄生组合式继承

function inheritPrototype(subType, superType) {
  let prototype = object(superType.prototype); // 创建对象
  prototype.constructor = subType; // 增强对象
  subType.prototype = prototype; // 赋值对象
}
function SuperType4(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType4.prototype.sayName = function() {
  console.log(this.name);
};
function SubType4(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
inheritPrototype(SubType4, SuperType4);
SubType4.prototype.sayAge = function() {
  console.log(this.age);
};
