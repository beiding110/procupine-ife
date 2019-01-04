var Chain = require('./Chain')

module.exports = {
    mixin(from, to, cover) {
        from = JSON.parse(JSON.stringify(from || {}));
        to = JSON.parse(JSON.stringify(to || {}));
        Object.keys(from).forEach(function(key, index) {
            if(!cover) {
                to[key] = to[key] ? to[key] : from[key];
            } else {
                to[key] = from[key];
            }
        });

        return to;
    },
    scrollin(from, to, cover) {
        Object.keys(from).forEach(function(key, index) {
            if(!cover) {
                to[key] = to[key] ? to[key] : from[key];
            } else {
                to[key] = from[key];
            }
        });
    },
    Chain
}

Object.prototype.loop = function(fun) {
    Object.keys(this).forEach(fun)
}
