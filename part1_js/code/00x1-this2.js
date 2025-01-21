// 易错题1
const object = {
  message: 'Hello, World!',
  logMessage() {
    console.log(this.message);
  }
};
setTimeout(object.logMessage, 1000);
setTimeout(()=>{
  object.logMessage()
}, 1000);

// undefined
// Hello, World


// 易错题2
const object2 = {
  who: 'World',
  greet() {
    return `Hello, ${this.who}!`;
  },
  farewell: () => {
    return `Goodbye, ${this.who}!`;
  }
};
console.log(object2.greet());
console.log(object2.farewell());

// Hello,world
// Goodbye,undefined

// 易错题3
var name = "window";
var obj3 = {
  name: "obj",
  sayName: function() {
    console.log(this.name);
    var innerFunc = function() {
      console.log(this.name);
    };
    innerFunc();
  },
  sayNameArrow: function() {
    console.log(this.name);
    var innerFuncArrow = () => {
      console.log(this.name);
    };
    innerFuncArrow();
  }
};
obj3.sayName();
obj3.sayNameArrow();

// obj, window
// obj, obj


// 易错题4
const btn = document.getElementById('btn');
const obj = {
  value: 42,
  clickHandler() {
    console.log(this.value); // 42
    const self = this;
    btn.addEventListener('click', function () {
      console.log(this.value); // undefined
      console.log(self.value); // 42
      const innerFunction = () => {
        console.log(this.value); // undefined
        console.log(self.value); // 42
      };
      innerFunction();
    });
  }
};
obj.clickHandler();



// 易错题5
var a = 10;
var obj = {
  a: 20,
  fn: function() {
    var a = 30;
    return this.a;
  }
};

console.log(obj.fn()); // 输出什么？
var fn = obj.fn;
console.log(fn()); // 输出什么？


// 20, 10


// 题目6
var a = 10;
var obj = {
  a: 20,
  fn: function() {
    var self = this;
    return function() {
      return self.a;
    };
  }
};

var innerFn = obj.fn();
console.log(innerFn()); // 输出什么？

// 20


// 题目7
var a = 10;
var obj = {
  a: 20,
  fn: function() {
    console.log(this.a);
  }
};

var fn = obj.fn;
fn(); // 输出什么？

// 10


