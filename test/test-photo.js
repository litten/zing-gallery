var photo = require('../lib/photo.js')({ staticFiles : 'test/photos', urlRoot : '' }),
assert = require('assert'),
request = {
  path : 'album1/photo/lake',
  params : ['album1', 'lake'],
  query : {}
},
response = {
  json : function(jsonResponse){
    // shouldn't get here
    console.log(jsonResponse);
    assert.ok(!jsonResponse, 'Got json response, expected res.render');
  },
  status : function(code){
    // shouldn't happen
    console.log('Error - got response code ' + code);
    return response;
  }
}, 
next =  function(){
  // call to common.render
  assert.ok(request.data, 'Request should have data to redner');
  assert.ok(request.tpl, 'Request should have a tpl to render');
  assert.ok(request.data.name === 'lake', 'Request should have photo name');
  assert.ok(request.data.exif.Make === 'Canon', 'Request should have exif info');
  console.log(__filename + ' passed ok ✓')
};

photo(request, response, next);
