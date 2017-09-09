// css
require('./theme.css')
require('./photoSwipe/photoswipe.css')
require('./photoSwipe/default-skin/default-skin.css')

// js
var swipe = require('./swipe.init')
var lazyload = require('./lazyload')

// todo: fix window

var lazy = {
	init: function() {
		var $img = document.getElementsByClassName('js-image');
		var $wrapArr = document.getElementsByClassName('img-wrap');
		var wrap = {
			width: 300,
			height: 200
		}
		if ($wrapArr && $wrapArr[0]) {
			var rectObj = $wrapArr[0].getBoundingClientRect();
			wrap.width = rectObj.width;
			wrap.height = rectObj.height;
		}
		for (var i = 0, len = $img.length; i < len; i++) {
			lazyload({
				container: document.getElementsByTagName('body')[0],
				wrap: wrap,
				$target: $img[i]
			})
		}
	}
}

window.onload = function() {
	swipe.init();
	lazy.init();
}
