// A basic bare-bones usage example where node-gallery does all the rendering. 
var express = require('express'),
port = 3000;
var app = express();
// In your project, this would be require('node-gallery')
app.use('/', require('../lib/gallery.js')({
  staticFiles : '../resources/photos',
  urlRoot : '/',
  title : 'Litten\'s Gallery'
}));

app.listen(port);
console.log('node-gallery listening on localhost:' + port);
