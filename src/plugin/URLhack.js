function URLhack(href) {
    this.init(href)
}

URLhack.prototype = {
    init(href) {
        var vdom = document.createElement('a');
        vdom.href = href;

        this.hash = vdom.hash;
        this.pathname = vdom.pathname;
        this.search = vdom.search;
        this.href = vdom.href;
        this.port = vdom.port;
        this.host = vdom.host;
        this.hostname = vdom.hostname;
        this.origin = vdom.origin;
        this.protocol = vdom.protocol;

        vdom = null;
    }
}

module.exports = URLhack
