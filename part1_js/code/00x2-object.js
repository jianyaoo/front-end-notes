// 工厂模式创建对象
function createPerson(name, age, job) {
  let o = new Object();
  o.name = name;
  o.age = age;
  o.job = job;
  o.sayName = function() {
    console.log(this.name);
  };
  return o;
}
let person1 = createPerson("Nicholas", 29, "Software Engineer");
let person2 = createPerson("Greg", 27, "Doctor");
  

// 构造函数创建对象
function Person(name, age, job){
  this.name = name;
  this.age = age;
  this.job = job;
  this.sayName = function() {
    console.log(this.name);
  };
}
let person1_1 = new Person("Nicholas", 29, "Software Engineer");
let person2_1 = new Person("Greg", 27, "Doctor");
// person1_1.sayName(); // Nicholas
// person1_1.sayName(); // Greg


// 遍历对象属性
const obj1 = {
  name: 'test',
  age: 11,
  1: 'number1',
  query: 'fe',
  3: 'number3'
}
for (let i in obj1){
  console.log(i)
}
console.log(Object.keys(obj1));
console.log(Object.getOwnPropertyNames(obj1));
