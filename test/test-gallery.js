var nodegallery = require('../lib/gallery'),
assert = require('assert'),
err, err2, gallery;

try{
  nodegallery({});
}catch(error){
  err = error;  
}
assert.ok(err, 'It throws on empty config');

try{
  gallery = nodegallery({staticFiles : 'static', urlRoot : 'gallery'});
}catch(error){
  err2 = error;
}

assert.ok(gallery, 'Gallery starts up with valid config params');
assert.ok(!err2, 'No error occurs on init');
console.log(__filename + ' passed ok ✓')
