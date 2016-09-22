var express = require('express'),
fs = require('fs'),
path = require('path'),
crypto = require('crypto'),
cache = require('memory-cache'),
imk = require('imagemagick'),
im = require('imagemagick-stream'),
images = require('images'),
common;

module.exports = function(config){
  var app = express(),
  staticFiles = config.staticFiles,
  common = require('./common')(config),
  album = require('./album')(config),
  photo = require('./photo')(config);
  
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');
  
  
  app.get('/gallery.css', function(req, res, next){
    var fstream = fs.createReadStream(path.join(__dirname, '..', 'css/gallery.css'));
    res.type('text/css');
    fstream.on('error', function(err){
      return common.error(req, res, next, 404, 'CSS File not found', err);
    });
    return fstream.pipe(res);
  });
  
  // Photo Page
  app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
    var filePath = path.join(staticFiles, req.path),
    fstream;
    
    filePath = decodeURI(filePath);
    
    fs.stat(filePath, function(err){
      if (err){
        return common.error(req, res, next, 404, 'File not found', err);
      }
      fstream = fs.createReadStream(filePath);
      fstream.on('error', function(err){
        return common.error(req, res, next, 404, 'File not found', err);
      });
      
      if (!req.query.tn){
        // return the full size file
        return fstream.pipe(res);
      }else{
        // streaming resize our file
        var cachedResizedKey, cacheWriteStream, cachedResult,
        resizer, dimensions, w, h;
        if (req.query.tn.toString() === '1'){
          w = (config.thumbnail && config.thumbnail.width) || 200;
          h = (config.thumbnail && config.thumbnail.height) || 200;
          dimensions = w + 'x' + h;
        }else {
          //w = (config.image && config.image.width) || '100%';
          //h = (config.image && config.image.height) || '100%';
          //dimensions = w + 'x' + h;
          // return the full size file
          return fstream.pipe(res);
        }
        
        cachedResizedKey = filePath;
        cachedResizedKey = crypto.createHash('md5').update(cachedResizedKey).digest('hex');

        cachedResizedKey = './tmp/s_' + path.basename(filePath)
        
        // Check the cache for a previously rezized tn of matching file path and dimensions
        /*cachedResult = cache.get(cachedResizedKey)
        console.log(cachedResult)*/
        // TODO - eventualyl should just try the fs.read on cachedResult, existsSync is a bad hack
        if (fs.existsSync(cachedResizedKey)){
          // cache hit - read & return
          var cacheReadStream = fs.createReadStream(cachedResizedKey);
          cacheReadStream.on('error', function(){
            return common.error(req, res, next, 404, 'File not found', err);
          });
          return cacheReadStream.pipe(res);  
        }
        
        // No result, create a write stream so we don't have to reize this image again
        //cacheWritePath = path.join('./tmp', cachedResizedKey);
        //cacheWriteStream = fs.createWriteStream(cacheWritePath);
        
        /*imk.resize({
          srcPath: filePath,
          dstPath: cacheWritePath,
          width:   256
        }, function(err, stdout, stderr){
          console.log(err)
          if (err) throw err;
          console.log('resized kittens.jpg to fit within 256x256px');
        });*/
        /*im.resize({
          srcData: fs.readFileSync(filePath, 'binary'),
          width:   256
        }, function(err, stdout, stderr){
          if (err) throw err
          fs.writeFileSync('s' + filePath, stdout, 'binary');
          console.log('resized kittens.jpg to fit within 256x256px')
        });*/
        /*
        resizer = im().resize(dimensions).quality(40);
        resizer.on('error', function(err){
          return common.error(req, res, next, 500, 'Error in IM/GM converting file', err);
        });*/
        
        /*resizer = images(path)
        .size(200)
        .save(cacheWritePath, {
          quality : 50
        });*/
        // var resizestream = fstream.pipe(resizer);
        //var resizestream = fstream;

        // Pipe to our tmp cache file, so we can use this in future
        //resizestream.pipe(cacheWriteStream);
        //cache.put(cachedResizedKey, cacheWritePath);
        
        // Also stream the resized result back to the requestee
        //return resizestream.pipe(res);
      }
    });
    
  });

  // Metadata files - just serve them
  app.get(/.+\.json$/i, function(req, res, next){
    var filePath = path.join(staticFiles, req.path),
    filePath = decodeURI(filePath);
    
    fs.stat(filePath, function(err){
      if (err){
        return common.error(req, res, next, 404, 'File not found', err);
      }
      fstream = fs.createReadStream(filePath);
      fstream.on('error', function(err){
        return common.error(req, res, next, 404, 'File not found', err);
      });
      return fstream.pipe(res);
    });
  });
  
  // Photo Pages - anything containing */photo/*
  app.get(/(.+\/)?photo\/(.+)/i, photo, common.render);
  // Album Page - everything that doesn't contain the photo string
  // regex source http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word
  app.get(/^((?!\/photo\/).)*$/, album, common.render);
  return app;
}
