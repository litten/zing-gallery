// css
require('./theme.css')
require('./photoSwipe/photoswipe.css')
require('./photoSwipe/default-skin/default-skin.css')

// js
var swipe = require('./swipe.init')
var lazyload = require('./lazyload')

// todo: fix window
window.lazy = lazyload({
	container: document.getElementsByTagName('body')[0]
})

window.onload = function() {
	swipe.init()
}
