

module.exports = {
    deferred() {
        const deferred = Promise.deferred();
        return {
            promise: deferred.promise,
            resolve: deferred.resolve,
            reject: deferred.reject
        };
    }
};