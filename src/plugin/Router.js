var routeBreaker = require('./routeBreaker')
var _ = require('../lib/pro_tool')
var routerPathMapper = require('./routerPathMapper')
var URLhack = require('./URLhack')

function Router(obj) {
    this.init(obj);
};

Router.prototype = {
    init(obj) {
        var that = this;

        this.routes = this.routesPretreatment(obj.routes);
        this.redAliPretreatment(this.routes);

        this.beforeEach = obj.beforeEach;
        this.afterEach = obj.afterEach;

        this.$router = {
            push(path) {
                that.hashHandler(path, 'push');
            },
            replace(path) {
                that.hashHandler(path, 'replace');
            },
            reload() {
                that.hashHandler(null, 'reload');
            }
        };

        this.$win = document.querySelector(obj.el).contentWindow;

        if(!window.location.hash) this.$router.replace('/');
        else this.routeHandler(window.location);

        this.initRouteObserver();
    },
    hashHandler(obj, type) {
        var newUrl = obj ? this.urlBuilder(obj) : '',
            that = this;

        var swicthObj = {
            push() {
                window.top.location.assign('' + newUrl);
            },
            replace() {
                window.top.location.replace('' + newUrl);
            },
            reload() {
                that.$win.location.reload();
            }
        };

        swicthObj[type]();
    },
    initRouteObserver() {
        window.addEventListener('hashchange', (e) => {
            this.routeHandler(e);
        })
    },
    routeHandler(obj) {
        var oldUrl = '',
            newURL = '',
            srcUrl = '',
            toRoute = {},
            fromRoute = {};

        (new _.Chain()).link(function(that, next) {

            //获取当前location.hash值
            if(obj instanceof Location || ('href' in obj)) {
                oldUrl =  newUrl = obj.hash.replace('#', '');
            } else {
                // oldUrl = new URL(obj.oldURL).hash.replace('#', ''),
                // newUrl = new URL(obj.newURL).hash.replace('#', '');

                oldUrl = new URLhack(obj.oldURL || obj.srcElement.location.hash).hash.replace('#', ''),
                newUrl = new URLhack(obj.newURL || obj.target.location.hash).hash.replace('#', '');
            };

            next();

        }).link(function(that, next) {

            //使用routeBreaker对当前hash值进行格式化
            toRoute = routeBreaker(newUrl);
            fromRoute = routeBreaker(oldUrl);

            //使用routerPathMapper对当前hash值进行匹配，找到对应的heml文件，并将新的格式结果混入对象
            _.scrollin(routerPathMapper(toRoute.path, that.routes), toRoute);
            _.scrollin(routerPathMapper(fromRoute.path, that.routes), fromRoute);

            next();

        }).link(function(that, next) {

            //判断是否存在重定向，是则进行重定向，别名路由不用处理
            if(toRoute.redirect) {
                that.$router.replace(toRoute.fullPath.replace(toRoute.path, toRoute.redirect));
                return;
            };

            next();

        }).link(function(that, next) {

            //生成新的iframe需要跳转的路径
            newUrl = that.routes ? toRoute.component : toRoute.fullPath;

            next();

        }).link(function(that, next) {

            //进入路由守卫
            if(that.beforeEach) {
                that.beforeEach(toRoute, fromRoute, next);
            }else {
                next();
            }

        }).link(function(that, next) {

            //给url加入时间戳并（不保存历史记录）跳转
            if(!newUrl) {
                return;
            };
            srcUrl = newUrl + (that.urlHasSearch(newUrl) ? '&' : '?') + 'ts=' + (new Date()).getTime();
            that.$win.location.replace(srcUrl);

            next();

        }).link(function(that, next) {

            //更新$route属性
            that.$route = toRoute

            next();

        }).link(function(that, next) {

            //进入后置钩子
            if(that.afterEach) {
                that.afterEach(toRoute, fromRoute);
            }

        }).run(this);
    },
    urlBuilder(obj) {
        var newPath = ''

        if(typeof(obj) === 'object') {
            newPath = obj.path;
            var search = '';

            if(obj.search) {
                Object.keys(obj.search).forEach(function(key, item) {
                    search += '&' + key + '=' + obj.search[key];
                });
            };

            newPath = newPath + (this.urlHasSearch(newPath) ? search : ((search ? '?' : '') + search.substring(1)));
        } else {
            newPath = obj;
        };

        return this.urlRATestBuilder(newPath);
    },
    urlRATestBuilder(newPath) {
        var newUrl = '#',
            currentFullPath = window.location.hash.substring(1),
            currPathArr = currentFullPath.split('/'),
            relative_path = null;

        if (/^\//.test(newPath)) {
            relative_path = [newPath];
        } else if (/^(\.\.\/)/.test(newPath)) {
            var matched_number = newPath.match(/(\.\.\/)/g).length;
            relative_path = currPathArr.slice(0, -(matched_number + 1));
            relative_path.push(newPath.replace(/(\.\.\/)/g, ''));
        } else {
            //if(/^(\.\/)/.test(newPath))
            relative_path = currPathArr.slice(0, -1);
            relative_path.push(newPath.replace('./', ''));
        }

        newUrl += relative_path.join('/');

        return newUrl;
    },
    urlHasSearch(url) {
        return /^[^\?=&!]+\?/g.test(url)
    },
    routesPretreatment(routes) {
        if(!routes) return false;

        var res = {},
            parentPath = '';

        function deepLoop(arr) {
            arr.forEach(function(item) {
                var path = item.path;
                parentPath = /^\//.test(path) ? path : (parentPath + '/' + path);

                if(item.children && item.children.length > 0) {
                    deepLoop(item.children);
                } else {
                    res[parentPath] = res[parentPath] ? res[parentPath] : item;

                    parentPath = '';
                };
            })
        };

        if(Array.isArray(routes)) {
            deepLoop(routes)
        } else if (typeof(routes) === 'object') {
            deepLoop([routes])
        }

        return res;
    },
    redAliPretreatment(routesObj) {
        if(!routesObj) return false;

        routesObj.loop(function(key) {
            if(routesObj[key].redirect) {
                _.scrollin(routesObj[routesObj[key].redirect], routesObj[key]);
            } else if (routesObj[key].alias) {
                _.scrollin(routesObj[routesObj[key].alias], routesObj[key]);
            }
        });
    }
}

module.exports = Router
