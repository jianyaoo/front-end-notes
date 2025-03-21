// 闭包实现2：延时触发及请求
// 延时请求，就依赖于上一次执行的时间或状态，所以就使用到了闭包函数，闭包函数保存了上次的时间或状态
// 思考：所以对于这种需要依赖之前状态的，可以考虑使用闭包函数

// 防抖：在触发某事件N秒后，执行实际的逻辑处理,即实际的处理逻辑是在触发后的N秒后执行，如果在N秒中间触发，会重新计时；
// delay依赖于最后一次事件的触发
// 场景：用户频繁操作且需要处理逻辑的场景，输入搜索、resize、滚动监听、鼠标移动事件等等

// 题目1：提供一个 cancel 方法来取消防抖函数的执行，停止等待。
function debounce2(fn, delay) {
  let timer = null;

  function Exc(...arg){
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, arg)
    }, delay)
  }

  Exc.prototype.cancel = function (){
    if (timer){
      clearTimeout(timer);
    }
  }

  return Exc;
}




const handleResize = debounce2(() => {
  console.log("resize事件")
}, 500);

window.addEventListener('resize', handleResize);


// 节流：限制高频率触发的事件，在指定时间内最多只执行1次
// 与防抖的区别：
// - 对事件的触发处理不同
// ---- 事件的频繁触发不会应该节流，节流按照自己的节奏，每搁N秒执行一次，即使在时间间隔之内触发了事件，也不会有任何响应及影响
// ---- 事件的频繁触发会应该防抖，每次触发都都会使防抖定时器触发，只有在停止频繁触发后的N秒内才会执行实际的处理逻辑
function throttle(fn, delay) {
  let lastTime = 0;

  return function (...arg) {
    const now = Date.now();
    if (now - lastTime > delay) {
      fn.apply(this, arg);
      lastTime = Date.now();
    }
  }
}

function throttle_2(fn, delay) {
  let timer = null;

  return function (...arg) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, arg);
        timer = null;
      }, delay)
    }
  }
}

// 实现一个节流函数 throttle(fn, delay)，要求节流函数第一次调用时立即执行，之后每隔 delay 毫秒执行一次。
function throttle_3(fn, delay, immediately = false){
  let timer = null;
  let hasFirst = false;

  return function (...arg){
    if (immediately && !hasFirst){
      fn.apply(this, arg);
      hasFirst = true;
      return;
    }

    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, arg);
        timer = null;
      }, delay)
    }
  }
}

function throttle_3_1(fn, delay, immediately = false){
  let timer = null;
  let lastTime = 0;

  return function (...arg){
    let now = Date.now();

    if (immediately && now - lastTime > delay){
      fn.apply(this, arg);
      lastTime = Date.now();
      return;
    }

    if (!timer){
      timer = setTimeout(()=>{
        fn.apply(this, arg);
        lastTime = Date.now();
        timer = null;
      }, delay - (now - lastTime))
    }
  }
}



const handleResize_1 = throttle(() => {
  console.log("resize事件")
}, 500);

window.addEventListener('resize', handleResize_1);
