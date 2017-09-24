// css
require('./theme.css')
require('./photoSwipe/photoswipe.css')
require('./photoSwipe/default-skin/default-skin.css')

var supportOrientation = (typeof window.orientation === 'number' && typeof window.onorientationchange === 'object');

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
		var $thumbs = document.getElementsByClassName('js-photos-thumb');
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
	lazy.init();
}

var checkWebp = function() {
	try {
		if (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0) {
			var $imgWrap = document.getElementsByClassName('js-img-wrap');
			for (var i = 0, len = $imgWrap.length; i < len; i++) {
				$imgWrap[i].setAttribute('href', $imgWrap[i].getAttribute('href') + '?tn=2');
			}
		}
	} catch (err) {
	}
}
window.onload = function() {
	resizeHandle();
	checkWebp();
	swipe.init();
	if (supportOrientation) {
		window.addEventListener('orientationchange', resizeHandle);
	} else {
		window.addEventListener('resize', resizeHandle);
	}
}
