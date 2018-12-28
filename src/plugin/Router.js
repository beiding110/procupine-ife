function Router(obj) {
    this.init(obj);
};

Router.prototype = {
    init(obj) {
        var that = this;
        this.route = obj.route;
        this.frameWin = document.querySelector(obj.el).contentWindow;

        this.$router = {
            push(path) {
                that.hashHandler(path, 'push');
            },
            replace(path) {
                that.hashHandler(path, 'replace');
            }
        };

        this.$route = {};

        this.routeHandler(window.location);
        this.initRouteObserver();
    },
    hashHandler(obj, type) {
        var newUrl = this.urlBuilder(obj);

        var swicthObj = {
            push() {
                window.location.assign('' + newUrl);
            },
            replace() {
                window.location.replace('' + newUrl);
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

        this.$route.fullPath = newUrl;

        this.frameWin.location.replace(newUrl);
    },
    urlBuilder(obj) {
        var newUrl = '#',
            currentFullPath = window.location.pathname;

        var currPathArr = currentFullPath.split('/');

        if(typeof(obj) === 'object') {
            newPath = object.path;
        } else {
            newPath = obj;
        };

        if(/^.\//.test(newPath)) {
            relative_path = currPathArr.slice(0, -1);
            relative_path.push(newPath.replace('./', ''));
        } else if (/^\//.test(newPath)) {
            relative_path = [newPath];
        } 
        // else if (/^..\//.test(newPath)) {
        //
        // }

        newUrl += relative_path.join('/');
        return newUrl;
    }
}

module.exports = Router
