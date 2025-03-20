const MyPromise = require('./MyPromise');

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