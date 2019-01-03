var RouteBreaker = require('./RouteBreaker')
var _ = require('../lib/pro_tool')

function Router(obj) {
    this.init(obj);
};

Router.prototype = {
    init(obj) {
        var that = this;
        this.routes = this.routesPretreatment(obj.routes);

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
            if(obj instanceof Location) {
                oldUrl =  newUrl = obj.hash.replace('#', '');
            } else {
                oldUrl = new URL(obj.oldURL).hash.replace('#', ''),
                newUrl = new URL(obj.newURL).hash.replace('#', '');
            };

            toRoute = new RouteBreaker(newUrl, that.routes),
            fromRoute = new RouteBreaker(oldUrl, that.routes);

            newUrl = that.routes ? toRoute.component : newUrl;

            if(newUrl) {
                next();
            };
        }).link(function(that, next) {
            if(that.beforeEach) {
                that.beforeEach(toRoute, fromRoute, next);
            }else {
                next();
            }
        }).link(function(that, next) {
            srcUrl = newUrl + (that.urlHasSearch(newUrl) ? '&' : '?') + 'ts=' + (new Date()).getTime();
            that.$win.location.replace(srcUrl);

            next();
        }).link(function(that, next) {
            var newRt = toRoute;
            that.$route = {
                fullPath: newRt.fullPath,
                query: newRt.query,
                path: newRt.path
            };

            next();
        }).link(function(that, next) {
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
                    res[parentPath] = item;
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
    }
}

module.exports = Router
