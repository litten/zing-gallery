var _ = require('underscore'),
path = require('path'),
ejs = require('ejs'),
fs = require('fs'),
config;

module.exports = function(cfg){
  config = cfg;
  return common;
};

var common = {};

common.breadcrumb = function(paths){
  paths = paths.split('/');
  var breadcrumb = [{
    name : config.title || 'Gallery',
    url : config.urlRoot
  }],
  joined = '';
  breadcrumb = breadcrumb.concat(_.map(paths, function(pathSeg){
    joined = path.join(joined, pathSeg);
    return {
      name : pathSeg,
      url : path.join(config.urlRoot, joined)
    }
  }));
  return breadcrumb;
}

common.friendlyPath = function(unfriendlyPath){
  return decodeURI(unfriendlyPath).replace(/^\//, '').replace(/\/$/, '');
}

common.error = function(req, res, next, status, message, errorObject){
  if (config.render === false){
    return next(JSON.stringify({ message : message, error : errorObject}));
  }
  return res.status(404).json({ message : message, error : errorObject});
};

common.render = function(req, res, next){
  var data = req.data,
  tpl = req.tpl;
  if (config.render === false){
    // only return compiled template file
    return fs.readFile(path.join(__dirname, '..', 'views', tpl), function(err, tplContents){
      if (err){
        return next(err);
      }
      try{
        req.html = ejs.render(tplContents.toString(), data);
      }catch(err){
        return next(err);
      }
      return next();  
    });
  }
  
  if (req.accepts('html')){
    return res.render(tpl, data);  
  }else{
    return res.json(data);
  }
  
}
