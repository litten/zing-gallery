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
		for (var i = 0, len = $img.length; i < len; i++) {
			lazyload({
				container: document.getElementsByTagName('body')[0],
				$target: $img[i],
				selector: '.js-image'
			})
		}
	}
}

var resizeHandle = function () {
	var iw = window.innerWidth;
	var ih = window.innerHeight;
	if (iw <= 700) {
		var $photos = document.getElementsByClassName('photos');
		if ($photos.length === 0) return;
		var $thumbs = $photos[0].getElementsByClassName('thumb');
		var width;
		if (iw >= ih) {
			// 横屏
			width = '25%';
		} else {
			// 竖屏
			width = '33.333333%';
		}
		for (var i = 0, len = $thumbs.length; i < len; i++) {
			$thumbs[i].style.width = width;
		}
	}
}

window.onload = function() {
	resizeHandle();
	lazy.init();
	swipe.init();
	window.addEventListener('resize', resizeHandle);
}
