var Router = require('./plugin/Router')
var _ = require('./lib/pro_tool')

function Ife(obj) {
    this.init(obj);
}

Ife.prototype = {
    init(obj) {
        if(obj) {
            this.$setting = obj;
            this.$data = obj.data; //data中的数据用于全页面共享
            this.$watch = obj.watch;

            route = new Router(this.$setting);

            this.$router = route.$router;
            this.$route = route.$route;
            this.$win = route.$win;

            this.initObserve(this.$data);
            this.initStorageEventCatcher();

            obj.mounted && obj.mounted.call(this);
        }
    },

    extend(top, obj) {
        this.$setting = obj;

        //顶部页面库补充
        this.$data = top.$data = _.mixin(obj.data, top.$data);
        top.initObserve(obj.data);
        this.initObserve(this.$data);

        this.$watch = _.mixin(top.$watch, obj.watch);

        this.$router = top.$router;
        this.$route = top.$route;

        this.initStorageEventCatcher();

        obj.mounted && obj.mounted.call(this);
    },

    initObserve(data) {
        Object.keys(data).forEach((key, index) => {
            if(!this[key]) {
                Object.defineProperty(this, key, {
                    get: () => {
                        return this.$data[key];
                    },
                    set: (val) => {
                        // console.log(key + '-has been setted:' + val);

                        this.catchHandler(val, this.$data[key], key);

                        this.emitStorageEvent({
                            type: 'data',
                            key: key,
                            oldValue: this.$data[key],
                            newValue: val
                        });
                    }
                })
            }
        })
    },

    emitStorageEvent(e) {
        sessionStorage.setItem('_ifeEvent', JSON.stringify(e));
    },

    initStorageEventCatcher() {
        if(!!sessionStorage){
            try {
                sessionStorage.setItem("_test_storage_key", "_test_storage_value");
                sessionStorage.removeItem("_test_storage_key");
            } catch(e) {
                alert('您的浏览器不支持sessionStorage');
                return false;
            }
        }else{
            alert('您的浏览器不支持sessionStorage');
            return false;
        }

        (window === window.top) && sessionStorage.removeItem('ifeEvent');
        window.addEventListener('storage', function(e) {
            if(e.key === '_ifeEvent') {
                var ev = JSON.parse(e.newValue);

                this.catchHandler(ev.newValue, ev.oldValue, ev.key);
            };
        }.bind(this));
    },

    catchHandler(n, o, key) {
        this.$data[key] = n;

        this.$watch[key] && this.$watch[key].call(this, n, o);
    }

}

module.exports = Ife;
