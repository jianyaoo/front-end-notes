function foo() {
  console.log(this); // windows
}

foo();


const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name);
  }
};

const greet = obj.greet;
greet();
// undefined


function Person(name) {
  this.name = name;
}

const john = new Person('John');
console.log(john.name);
// John


const obj_1 = {
  name: 'Bob',
  greet: function() {
    setTimeout(() => {
      console.log(this.name);
    }, 1000);
  }
};

obj_1.greet();
// Bob

function greet_1(city, country) {
  console.log(`${this.name} lives in ${city}, ${country}`);
}

const person = { name: 'Alice' };

greet_1.call(person, 'Paris', 'France');
greet_1.apply(person, ['London', 'UK']);
const boundGreet = greet_1.bind(person);
boundGreet('New York', 'USA');

// Alice Paris France
// Alice London UK
// Alice New York USA


const obj2 = {
  name: 'John',
  greet: function() {
    setTimeout(function() {
      console.log(this.name);
    }, 1000);
  }
};

obj2.greet();
// undefined


class Person2 {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(this.name);
  }
}

const person2 = new Person2('Alice');
person.greet();
//  Alice








