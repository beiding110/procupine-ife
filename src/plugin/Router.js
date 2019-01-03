var RouteBreaker = require('./RouteBreaker')
var _ = require('../lib/pro_tool')

function Router(obj) {
    this.init(obj);
};

Router.prototype = {
    init(obj) {
        var that = this;
        this.routes = obj.routes;
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
                that.routeHandler(window.location);
            }
        };

        this.$win = document.querySelector(obj.el).contentWindow;

        this.routeHandler(window.location);
        this.initRouteObserver();
    },
    hashHandler(obj, type) {
        var newUrl = this.urlBuilder(obj);

        var swicthObj = {
            push() {
                window.top.location.assign('' + newUrl);
            },
            replace() {
                window.top.location.replace('' + newUrl);
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
        var oldUrl = '', newURL = '', srcUrl = '';
        (new _.Chain()).link(function(that, next) {
            if(obj instanceof Location) {
                oldUrl =  newUrl = obj.hash.replace('#', '');
            } else {
                oldUrl = new URL(obj.oldURL).hash.replace('#', ''),
                newUrl = new URL(obj.newURL).hash.replace('#', '');
            };

            srcUrl = newUrl + (that.urlHasSearch(newUrl) ? '&' : '?') + 'ts=' + (new Date()).getTime();

            if(newUrl) {
                next();
            }
        }).link(function(that, next) {
            if(that.beforeEach) {
                that.beforeEach(new RouteBreaker(newUrl), new RouteBreaker(oldUrl), next);
            }else {
                next();
            }
        }).link(function(that, next) {
            that.$win.location.replace(srcUrl);

            next();
        }).link(function(that, next) {
            var newRt = new RouteBreaker(newUrl);
            that.$route = {
                fullPath: newRt.fullPath,
                query: newRt.query,
                path: newRt.path
            };

            next();
        }).link(function(that, next) {
            if(that.afterEach) {
                that.afterEach(new RouteBreaker(newUrl), new RouteBreaker(oldUrl));
            }
        }).run(this);
    },
    urlBuilder(obj) {
        var newUrl = '#',
            newPath = '',
            currentFullPath = window.location.hash.substring(1);

        var currPathArr = currentFullPath.split('/');

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
    }
}

module.exports = Router
