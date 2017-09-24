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
        var tn = parseInt(req.query.tn);
        var tmpPath;
        var tmpType;
        if (tn === 1) {
          tmpPath = './tmp/';
          tmpType = '.jpg';
        } else if (tn === 2){
          tmpPath = './tmp_webp/';
          tmpType = '.webp';
        } else if (tn === 3) {
          tmpPath = './tmp_large/';
          tmpType = '.jpg';
        }
        // streaming resize our file
        var cachedResizedKey;
        var md5Name = crypto.createHash('md5').update(filePath).digest('hex')
        cachedResizedKey = tmpPath + md5Name + tmpType;
        
        //console.log(filePath)
        if (fs.existsSync(cachedResizedKey)){
          // cache hit - read & return
          var cacheReadStream = fs.createReadStream(cachedResizedKey);
          cacheReadStream.on('error', function(){
            return common.error(req, res, next, 404, 'File not found', err);
          });
          return cacheReadStream.pipe(res);  
        }

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
  app.post(/^((?!\/photo\/).)*$/, album, common.render);
  return app;
}
