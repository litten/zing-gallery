require('events').EventEmitter.prototype._maxListeners = 100;
var resize = require('./lib/resize'),
cfg = require('./config'),
express = require('express'),
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000,
host = process.env.OPENSHIFT_NODEJS_IP;

var photosPath = './resources/photos';
resize.init(photosPath)

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/assets/dist/'));
app.use('/', require('./lib/gallery.js')(Object.assign({
  staticFiles : 'resources/photos',
  urlRoot : '/',
  title : 'Zing Gallery',
  render : false
}, cfg)), function(req, res, next){
  return res.render('gallery', Object.assign({ 
  	galleryHtml : req.html
  }, cfg));
});


app.listen(port, host);
host = host || 'localhost';
console.log('zing-gallery listening on ' + host  + ':' + port);
