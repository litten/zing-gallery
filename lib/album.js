var fs = require('fs'),
path = require('path'),
cache = require('memory-cache'),
crypto = require('crypto'),
im = require('imagemagick-stream'),
sizeOf = require('image-size'),
exif = require('./exif'),
URL = require('url'),
formidable = require('formidable'),
isPhoto = /(\.(jpg|bmp|jpeg|gif|png|tif))$/i,
_ = require('underscore'),
common,
config;

function getExInfo(photoFileSystemPath) {
  return new Promise(function(resolve, reject) {
    exif(photoFileSystemPath, function(exifErr, exifInfo){
      exifInfo = exifInfo || {};
      if (exifErr){
        reject(exifErr);
      }
      fs.stat(photoFileSystemPath, function(err, fileData) {
        fileData = fileData || {};
        if (err || !fileData) {
          reject(exifErr);
        } else {
          exifInfo.size = fileData.size || 0;
          var data = {
            name: path.basename(photoFileSystemPath),
            exif: exifInfo
          };
          resolve(data);
        }
      })
    });
  })
}

function checkPassword(req, json) {
  return new Promise(function(resolve, reject) {
    if (json.password) {
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
        fields.password === json.password ? resolve() : reject();
      });
    } else {
      resolve();
    }
  })
}

module.exports = function(cfg){
  config = cfg;
  common = require('./common')(config);
  return function(req, res, next){
    // Retrieve the path, decoding %20s etc, replacing leading & trailing slash
    var pathFromReq = common.friendlyPath(req.path),
    staticFilesPath = './' + path.join(config.staticFiles, pathFromReq),
    data = _.clone(config);

    var json = data.albums[pathFromReq] || {}
    /*
     Request for an album thumbnail - TODO consider splitting out
     */
    if (req.query && req.query.tn){
      return _thumbnail(staticFilesPath, pathFromReq, json, function(err, thumb){
        if (err){
          return common.error(req, res, next, 404, 'No thumbnail found for this album', err);
        }

        var cachedResizedKey;
        var md5Name = crypto.createHash('md5').update(path.join(thumb)).digest('hex')
        cachedResizedKey = './tmp/' + md5Name + '.jpg';

        if (fs.existsSync(cachedResizedKey)){
          // cache hit - read & return
          var cacheReadStream = fs.createReadStream(cachedResizedKey);
          cacheReadStream.on('error', function(){
            return common.error(req, res, next, 404, 'File not found', err);
          });
          return cacheReadStream.pipe(res);  
        }
        return 'resizestream.pipe(res)';       

      });
    }
    /*
      Determined we're not requesting the thumbnail file - render the album page
     */

    (req.path !== '/favicon.ico') && fs.readdir(staticFilesPath, function (err, files) {
      if (err){
        return;
        // return common.error(req, res, next, 404, 'No album found', err);
      }
      
      data.config = config;
      data.isRoot = (req.path === '/' || req.path === '');
      data.breadcrumb = common.breadcrumb(pathFromReq);
      data.noDate = json.noDate;
      data.name = json.name || _.last(data.breadcrumb).name || config.title;
      data.description = json.description;
      data.password = json.password;

      data.albums = _getAlbums(files, staticFilesPath, pathFromReq, json);

      checkPassword(req, json).then(function() {
        _getPhotos(files, staticFilesPath, pathFromReq, function(photoData) {
          data.photos = photoData;
          req.data = data;
          req.tpl = 'album.ejs';
          return next();
        });
      }, function() {
        req.data = {
          title: config.title,
          wording: config.wording.noAccess
        }
        req.tpl = 'empty.ejs';
        return next();
      });
    });
  }
}

function _getAlbums(files, staticFilesPath, pathFromReq, json){
  files = _.filter(files, function(file){
    var stat = fs.statSync(path.join(staticFilesPath, file));
    return stat.isDirectory()
  });
  
  files = _.map(files, function(albumName){
    return {
      url : path.join(config.urlRoot, pathFromReq, albumName),
      name : albumName,
      password: (config.albums[albumName] && config.albums[albumName].password) ? config.albums[albumName].password : null,
      passwordTips: (config.albums[albumName] && config.albums[albumName].passwordTips) ? config.albums[albumName].passwordTips : 'password needed',
    };
  });
  return files;
}

function formatName (time) {
  return parseInt(time.replace(/(:|\s)+/g, ''));
}

function sortByTime (files, albumPath) {
  var json = config.albums[path.basename(albumPath)];
  var sortByTime = true;
  if (json && json.sort === 1) {
    // 时间倒序
    sortByTime = false;
  }

  for (var i = 0, len = files.length; i < len; i++) {
    for (var j = i + 1; j < len; j++) {
      var hasExif = files[i].exif && files[j].exif
      if (hasExif && compare) {
        var compare
        var iTime = files[i].exif.Time || 0
        var jTime = files[j].exif.Time || 0
        if (sortByTime) {
          compare = (iTime > jTime)
        } else {
          compare = (iTime < jTime)
        }
        var temp = files[i];
        files[i] = files[j];
        files[j] = temp;
      }
    }
  }
  return files;
}
function _getPhotos(files, staticFilesPath, pathFromReq, cb){
  files = _.filter(files, function(file){
    var stat = fs.statSync(path.join(staticFilesPath, file));
    return file.match(isPhoto) && !stat.isDirectory()
  });

  var promiseArr = []
  var exifMap = {}
  files.forEach(function(photoFileName) {
    promiseArr.push(
      getExInfo(path.join(staticFilesPath, photoFileName))
      .then(function(data) {
        exifMap[photoFileName] = data.exif
      })
    );
  })
  Promise.all(promiseArr).then(function() {
    files = _.map(files, function(photoFileName){
      var photoName = photoFileName.replace(isPhoto, '');
      var dimensions = sizeOf(path.join(staticFilesPath, photoFileName));
      return {
        url : path.join(config.urlRoot, pathFromReq, 'photo', photoName),
        src : path.join(config.urlRoot, pathFromReq, photoFileName),
        path : path.join(pathFromReq, photoFileName),
        size: dimensions.width + 'x' + dimensions.height,
        name : photoName,
        exif: exifMap[photoFileName] || null
      };
    });

    cb(sortByTime(files, path.join(staticFilesPath, '')))
  });
}

// 获取封面
function _thumbnail(albumPath, pathFromRequest, json, cb){
  if (json.thumbnail) {
    return cb(null, path.join(albumPath, json.thumbnail));
  } else {
    // TODO - This is a bit messy - reduce number of params we need to pass
    fs.readdir(albumPath, function (err, files) {
      _getPhotos(files, albumPath, pathFromRequest, function(photoData) {
        var photos = photoData;
        albums = _getAlbums(files, albumPath, pathFromRequest, json);
        if (photos.length > 0){
          var firstPhoto = _.first(photos).path;
          firstPhoto = path.join(config.staticFiles, firstPhoto);
          return cb(null, firstPhoto)
        }else if (albums.length > 0){
          // No photos found - iterate thru the albums and find a suitable child to return
          // TODO: If this first sub-album is empty this will fail. Is this OK?
          var firstAlbum = _.first(albums).name;
          return _thumbnail(path.join(albumPath, firstAlbum), path.join(pathFromRequest, firstAlbum), json, cb);
        }else{
          // None exist
          return cb('No suitable thumbnail found');  
        }
      })
    });
  }
}
