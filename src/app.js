var resize = require('../lib/resize'),
express = require('express'),
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000,
host = process.env.OPENSHIFT_NODEJS_IP;

resize.init('./resources/photos')

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/assets'))

app.use('/', require('../lib/gallery.js')({
  staticFiles : 'resources/photos',
  urlRoot : '/',
  title : 'Litten\'s Gallery',
  render : false // 
}), function(req, res, next){
  return res.render('gallery', { galleryHtml : req.html });
});


app.listen(port, host);
host = host || 'localhost';
console.log('node-gallery listening on ' + host  + ':' + port);
