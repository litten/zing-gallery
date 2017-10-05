// css
require('./theme.css')
require('./photoSwipe/photoswipe.css')
require('./photoSwipe/default-skin/default-skin.css')
require('./orientationchange');

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

var resizeHandle = function (type) {
	var iw = window.innerWidth;
	var ih = window.innerHeight;
	if (iw <= 750) {
		var $thumbs = document.getElementsByClassName('js-photos-thumb');
		var width;
		if (type === 'landscape') {
			// 横屏
			width = '20%';
		} else if (type === 'portrait') {
			// 竖屏
			width = '33.333333%';
		}
		for (var i = 0, len = $thumbs.length; i < len; i++) {
			$thumbs[i].style.width = width;
		}
	}
	lazy.init();
}

var checkImgType = function() {
	try {
		var $imgWrap = document.getElementsByClassName('js-img-wrap');
		var u = window.navigator.userAgent;
		var isMobile = !!u.match(/AppleWebKit.*Mobile.*/);
		var isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
		var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
		var isWeixin = (u.indexOf('MicroMessenger') === -1);

		if (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0) {
			for (var i = 0, len = $imgWrap.length; i < len; i++) {
				$imgWrap[i].setAttribute('href', $imgWrap[i].getAttribute('href') + '?tn=2');
			}
			document.getElementsByTagName('body')[0].className = 'webp';
		} else if (isMobile || isIos || isAndroid || isWeixin) {
			for (var i = 0, len = $imgWrap.length; i < len; i++) {
				$imgWrap[i].setAttribute('href', $imgWrap[i].getAttribute('href') + '?tn=3');
				var sizeArr = $imgWrap[i].getAttribute('data-size').split('x');
				$imgWrap[i].setAttribute('data-size', '621x' + sizeArr[1] * 621 / sizeArr[0]);
			}
		}
	} catch (err) {
	}
}
window.onload = function() {
	var curType = window.neworientation.init;
	resizeHandle(curType);
	checkImgType();
	swipe.init();

	window.addEventListener('orientationchange', function () {
		if (curType !== window.neworientation.current) {
			resizeHandle(window.neworientation.current);
			curType = window.neworientation.current;
		}
	}, false);
}
