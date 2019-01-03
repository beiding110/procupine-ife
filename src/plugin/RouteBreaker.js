var _ = require('../lib/pro_tool')

function RouteBreaker(path, routers) {
    this.init(path, routers)
}

RouteBreaker.prototype = {
    init(path, routers) {
        var breakArr = path.split('?');

        this.fullPath = path;
        this.path = breakArr[0];
        this.query = this.queryBuilder(breakArr[1]);

        this.routerMapper(this.path, routers)
    },

    queryBuilder(str) {
        var queryStr = '',
            queryArr = [],
            query = {};

        if(str) {
            queryStr = str;
            queryArr = queryStr.split('&');
            queryArr.forEach(function(item) {
                var arr = item.split('=');
                query[arr[0]] = arr[1];
            });
        };

        return query;
    },

    routerMapper(path, routers) {
        if(routers) {
            var routeItem = routers[this.path];
            if(!routeItem) {
                console.error('无法获取到对应的页面，请确认该路由路径与页面正确匹配！');
            } else {
                _.scrollin(routeItem, this);
            }
        }
    }
}

module.exports = RouteBreaker
