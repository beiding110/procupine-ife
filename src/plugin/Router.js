var RouteBreaker = require('./RouteBreaker')

function Router(obj) {
    this.init(obj);
};

Router.prototype = {
    init(obj) {
        var that = this;
        this.route = obj.route;

        this.$router = {
            push(path) {
                that.hashHandler(path, 'push');
            },
            replace(path) {
                that.hashHandler(path, 'replace');
            }
        };

        this.$route = {
            $win: document.querySelector(obj.el).contentWindow
        };

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
        var oldUrl = '', newURL;
        if(obj instanceof Location) {
            newUrl = obj.hash.replace('#', '');
        } else {
            oldUrl = new URL(obj.oldURL).hash.replace('#', ''),
            newUrl = new URL(obj.newURL).hash.replace('#', '');
        };

        var newRt = new RouteBreaker(newUrl);
        this.$route.fullPath = newRt.fullPath;
        this.$route.query = newRt.query;
        this.$route.path = newRt.path;

        newUrl = newUrl + (this.urlHasSearch(newUrl) ? '&' : '?') + 'ts=' + (new Date()).getTime();

        this.$route.$win.location.replace(newUrl);
    },
    urlBuilder(obj) {
        var newUrl = '#',
            currentFullPath = window.location.pathname;

        var currPathArr = currentFullPath.split('/');

        if(typeof(obj) === 'object') {
            newPath = obj.path;
            var search = '';

            Object.keys(obj.search).forEach(function(key, item) {
                search += '&' + key + '=' + obj.search[key];
            });

            newPath = newPath + (this.urlHasSearch(newPath) ? search : ('?' + search.substring(1)));
        } else {
            newPath = obj;
        };

        if (/^\//.test(newPath)) {
            relative_path = [newPath];
        } else if(/^(\.\/)/.test(newPath)) {
            relative_path = currPathArr.slice(0, -1);
            relative_path.push(newPath.replace('./', ''));
        } else if (/^(\.\.\/)/.test(newPath)) {
            var matched_number = newPath.match(/(\.\.\/)/g).length;
            relative_path = currPathArr.slice(0, -(matched_number));
            relative_path.push(newPath.replace(/(\.\.\/)/g, ''));
        }

        newUrl += relative_path.join('/');
        return newUrl;
    },
    urlHasSearch(url) {
        return /^[^\?=&!]+\?/g.test(url)
    }
}

module.exports = Router
