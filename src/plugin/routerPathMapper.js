function routerPathMapper(path, routers) {
    if(routers) {
        var routeItem = routers[path];
        if(!routeItem) {
            console.error('无法获取到对应的页面，请确认该路由路径与页面正确匹配！');
        } else {
            //_.scrollin(routeItem, this);
            return routeItem
        }
    };

    return {};
}

module.exports = routerPathMapper
