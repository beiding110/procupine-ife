var _ = require('../lib/pro_tool')

function URLhack(href) {
    var vdom = document.createElement('a');
    vdom.href = href;
    _.scrollin(vdom, this);
}

module.exports - URLhack
