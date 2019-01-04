var _ = require('../lib/pro_tool')

function routeBreaker(path) {
    var breakArr = path.split('?'),
        res = {};

    res.fullPath = path;
    res.path = breakArr[0];
    res.query = queryBuilder(breakArr[1]);

    // this.routerMapper(this.path, routers)

    return res
}

function queryBuilder(str) {
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
}

// routerMapper(path, routers) {
//     if(routers) {
//         var routeItem = routers[this.path];
//         if(!routeItem) {
//             console.error('无法获取到对应的页面，请确认该路由路径与页面正确匹配！');
//         } else {
//             _.scrollin(routeItem, this);
//         }
//     }
// }

module.exports = routeBreaker
