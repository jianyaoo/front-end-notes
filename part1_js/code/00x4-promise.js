/**
 * @param {Function} fn
 * @param {Array} args
 * @param {number} t
 * @return {Function}
 */
var cancellable = function(fn, args, t) {
    fn.apply(null, args);

    const timerId = setInterval(()=>{
        fn.apply(null, args);
    },t)

    return ()=>{
        clearInterval(timerId);
    }
};


/**
 * 2637. Promise Time Limit
 * @param {Function} fn
 * @param {number} t
 * @return {Function}
 */
var timeLimit = function(fn, t) {
    return async function(...args) {
        return Promise.race([fn(...args), new Promise((_, reject) => {
            setTimeout(() => {
                reject("Time Limit Exceeded");
            }, t);
        })]);
    };
};


// 2622 Cache With Time Limit
class TimeLimitedCache{
    constructor(){
        this.cache = {};
    }

    set(key,value, duration){
       const oldValue = this.cache[key];

       if (oldValue){
        clearTimeout(oldValue.timerId);
       }

        this.cache[key] = {
            value,
            timerId: setTimeout(()=>{
                delete this.cache[key];
            },duration)
        };

        if (oldValue){
            return true;
        } else {
            return false;
        }
    }

    get(key){
        if (this.cache[key]){
            return this.cache[key].value;
        } else {
            return -1;
        }
    }

    count(){
        return Object.keys(this.cache).length;
    }
}


// 2627 防抖
var debounce = function(fn, t) {
    let timer = null;

    return function(...args) {
        if(timer){
            clearTimeout(timer);
        }

        timer = setTimeout(()=>{
            fn(...args);
            timer = null;
        },t)
    }
};


// 2721 并行执行函数
var promiseAll = function(functions) {
    const result = [];
    const done = [];;

    return new Promise((resolve, reject) => {
        for(let i = 0; i < functions.length; i++){
            functions[i]()
                .then((res)=>{
                    result[i] = res;
                    done.push(i);
                    if (done.length === functions.length){
                        resolve(result);
                    }
                })
                .catch((err)=>{
                    reject(err);
                })
        }
    })
};
