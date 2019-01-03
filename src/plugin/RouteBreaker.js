function RouteBreaker(path) {
    this.init(path)
}

RouteBreaker.prototype = {
    init(path) {
        var breakArr = path.split('?'),
            queryStr = '',
            queryArr = [],
            query = {};

        this.fullPath = path;
        this.path = breakArr[0];

        if(breakArr[1]) {
            queryStr = breakArr[1];
            queryArr = queryStr.split('&');
            queryArr.forEach(function(item) {
                var arr = item.split('=');
                query[arr[0]] = arr[1];
            });
        }

        this.query = query;
    }
}

module.exports = RouteBreaker
