// 闭包的实现1 => 私有变量的封装
// 对闭包的一些解释：https://chatgpt.com/share/677f87c0-ac90-8012-92ab-9a3edb78245a

function closure(){
  let color = 'blue';
  return function (){
    let preFix = 'get color';
    return `${preFix} ${color}`
  }
}



// 基础计时器功能
function createResettableCounter(limit) {
  let count = 0;

  return function () {
    count++;
    console.log(count);

    if (count === limit) {
      console.log(`计时器达到上限${limit}`);
      count = 0;
    }
  }
}

// const counter = createResettableCounter();
// setInterval(counter, 1000)


// 复杂功能计时器
function createCounter2(
  limit,
  repeat,
  increaseCB = () => {},
  limitCB = () => {}
) {
  let count = 0;
  let pause = false;
  let timer = null;

  function startCounter() {
    if (timer) {
      console.warn(`当前计数器已启动，请勿重复启动`);
      return;
    }

    timer = setInterval(() => {
      if (pause){
        console.log("当前计数器已暂停");
        return;
      }

      count++;
      increaseCB(count)

      if (count === limit) {
        console.log(`计数器已达到上限${limit}`);
        limitCB(count, limit);
        count = 0;
      }
    }, repeat)
  }

  function stopCounter() {
    if (timer){
      clearInterval(timer);
      timer = null;
      count = 0;
    } else {
      console.log("计数器已停止")
    }
  }

  function pauseCounter() {
    if (pause){
      console.log("计数器已暂停")
    } else {
      pause = true;

      if (timer){
        clearInterval(timer)
        timer = null;
      }
    }
  }

  function resumeCounter() {
    if (!pause){
      console.log("当前计数器未处于暂停状态，无需恢复")
    } else {
      pause = false;
      startCounter();
    }
  }

  return {
    startCounter,
    stopCounter,
    pauseCounter,
    resumeCounter
  }
}

// 特别说明：对闭包的引用 => counterOBJ为全局对象，当不需要使用计数器后，需要手动清除counterOBJ，避免内存泄露
const counterOBJ = createCounter2(50, 1000, (c)=>{console.log(c)});
counterOBJ.startCounter();

setTimeout(counterOBJ.pauseCounter, 10 * 1000);
setTimeout(counterOBJ.resumeCounter, 60 * 1000);
