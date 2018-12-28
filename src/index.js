var Router = require('./plugin/Router')

function Ife(obj) {
    this.init(obj);
}

Ife.prototype = {
    init(obj) {
        this.$setting = obj;
        this.$data = obj.data; //data中的数据用于全页面共享
        this.$watch = obj.watch;

        route = new Router(this.$setting);

        this.$router = route.$router;
        this.$route = route.$route;

        this.initObserve(this.$data);
    },

    initObserve(data) {
        Object.keys(data).forEach((key, index) => {
            Object.defineProperty(this, key, {
                get: () => {
                    return this.$data[key];
                },
                set: (val) => {
                    console.log(key + '-has been setted:' + val);
                }
            })
        })
    }
}

module.exports = Ife;
