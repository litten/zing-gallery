// Usage example with ExpressJS
var express = require('express'),
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000,
host = process.env.OPENSHIFT_NODEJS_IP;

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('./'));

// In your project, this would be require('node-gallery')
app.use('/gallery', require('../lib/gallery.js')({
  staticFiles : 'resources/photos',
  urlRoot : 'gallery',
  title : 'Litten\'s Gallery',
  render : false // 
}), function(req, res, next){
  return res.render('gallery', { galleryHtml : req.html });
});


app.listen(port, host);
host = host || 'localhost';
console.log('node-gallery listening on ' + host  + ':' + port);
