module.exports = lazyload;
 
var inView = require('in-view');
var lazyAttrs = ['data-src'];

var isInit = false;

// Provide libs using getAttribute early to get the good src
// and not the fake data-src
// replaceGetAttribute('Image');
// replaceGetAttribute('IFrame');
 
function registerLazyAttr(attr) {
  if (indexOf.call(lazyAttrs, attr) === -1) {
    lazyAttrs.push(attr);
  }
}
 
function lazyload(opts) {
  opts = merge({
    src: 'data-src',
    container: false,
  }, opts || {});
  
  var elt = opts.$target;

  if (typeof opts.src === 'string') {
    registerLazyAttr(opts.src);
  }
 
  var elts = [];

  function setSize(elt, preW, preH) {
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
    var wrapW = wrap.width;
    var wrapH = wrap.height;
    if (wrapW / wrapH < preW / preH) {
      elt.style.height = wrapH;
      var result = (wrapW - wrapH * preW / preH) / 2;
      if (result < 0) {
        elt.style.marginLeft = result + 'px';
      }
    } else {
      elt.style.width = wrapW;
      var result = (wrapH - wrapW * preH / preW) / 2;
      if (result < 0) {
        elt.style.marginTop = result + 'px';
      }
    }
  }

  function show(elt) {
    if (elt.getAttribute('data-lzled')) {
      setSize(elt, elt.naturalWidth, elt.naturalHeight);
    } else {
      var src = findRealSrc(elt);
      if (src) {
        var $preloadImg = new Image();
        $preloadImg.src = src;
        $preloadImg.onload = function () {
          elt.src = '';
          var preW = $preloadImg.width;
          var preH = $preloadImg.height;
          setSize(elt, preW, preH);
          elt.src = src;
          elt.removeAttribute('data-not-lz');
          elt.setAttribute('data-lzled', true);
        }
      }
      elts[indexOf.call(elts, elt)] = null;
    }
  }
 
  function findRealSrc(elt) {
    if (typeof opts.src === 'function') {
      return opts.src(elt);
    }
 
    return elt.getAttribute(opts.src);
  }
  
  function resizeHandle() {
    if (inView.is(elt)) {
      show(elt);
    }
  }

  function register(elt) {
    // unsubscribe onload
    // needed by IE < 9, otherwise we get another onload when changing the src
    elt.onload = null;
    elt.removeAttribute('onload');
 
    // https://github.com/vvo/lazyload/issues/62
    elt.onerror = null;
    elt.removeAttribute('onerror');
 
    if (indexOf.call(elts, elt) === -1 && !isInit) {
      inView(opts.selector).on('enter', show);
      isInit = true;
    }

    resizeHandle();
    window.addEventListener('resize', resizeHandle);
  }
  register(elt);
}
 
function replaceGetAttribute(elementName) {
  var fullname = 'HTML' + elementName + 'Element';
  if (fullname in global === false) {
    return;
  }
 
  var original = global[fullname].prototype.getAttribute;
  global[fullname].prototype.getAttribute = function(name) {
    if (name === 'src') {
      var realSrc;
      for (var i = 0, max = lazyAttrs.length; i < max; i++) {
        realSrc = original.call(this, lazyAttrs[i]);
        if (realSrc) {
          break;
        }
      }
 
      return realSrc || original.call(this, name);
    }
 
    // our own lazyloader will go through theses lines
    // because we use getAttribute(opts.src)
    return original.call(this, name);
  };
}
 
function merge(defaults, opts) {
  for (var name in defaults) {
    if (opts[name] === undefined) {
      opts[name] = defaults[name];
    }
  }
 
  return opts;
}
 
// http://webreflection.blogspot.fr/2011/06/partial-polyfills.html
function indexOf(value) {
  for (var i = this.length; i-- && this[i] !== value;) {}
  return i;
}