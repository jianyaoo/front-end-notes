const MyPromise = require('./MyPromise');
// 使用官方提供的827个测试用例进行测试
module.exports = {
    deferred() {
        const deferred = MyPromise.deferred();
        return {
            promise: deferred.promise,
            resolve: deferred.resolve,
            reject: deferred.reject
        };
    }
};