/**
 * 责任链类
 * @constructor
 */
function Chain() {
	this.chain_arr = [];
}

Chain.prototype = {
	/**
	 * 链的内容
	 * @param  {function} fun 待执行函数，包含两个参数：通用参数及执行下一环节的函数
	 * @return {this}     返回自身，可链式调用
	 */
	link: function (fun) {
		var that = this;
		if (typeof (fun) == 'function') {
			this.chain_arr.push(fun);
		};
		return this;
	},
	/**
	 * 执行责任链
	 * @param  {Object} obj 责任链中的通用参数
	 * @return {null}     [description]
	 */
	run: function (obj) {
		var that = this,
			index = 0,
			obj = obj;

		var loop = function () {
			var this_node = that.chain_arr[index];
			index++;
			if (!!this_node) {
				return this_node(obj, loop)
			}
		};

		loop();
	}
};

module.exports = Chain
