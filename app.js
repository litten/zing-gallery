var resize = require('./lib/resize'),
cfg = require('./config')
watch = require('watch')
express = require('express'),
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000,
host = process.env.OPENSHIFT_NODEJS_IP;

var photosPath = './resources/photos';
resize.init(photosPath)
watch.watchTree(photosPath, function (f, curr, prev) {
    resize.init(photosPath)
})

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/assets/dist/'))

app.use('/', require('./lib/gallery.js')({
  staticFiles : 'resources/photos',
  urlRoot : '/',
  title : cfg.title || 'Zing Gallery',
  render : false
}), function(req, res, next){
  return res.render('gallery', Object.assign({ 
  	galleryHtml : req.html
  }, cfg));
});


app.listen(port, host);
host = host || 'localhost';
console.log('node-gallery listening on ' + host  + ':' + port);
