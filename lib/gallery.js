var common;

module.exports = function(config){
  if (!config){
    throw new Error('No config specified');
  }
  
  if (!config.staticFiles || !config.urlRoot){
    throw new Error('Both staticFiles and urlRoot must be specified');
  }
  
  var common = require('./common')(config), 
  middleware;
  
  // Remove any potential trailing or leading / from our paths
  config.staticFiles = common.friendlyPath(config.staticFiles);
  config.urlRoot = common.friendlyPath(config.urlRoot);
  
  middleware = require('./middleware')(config);
  
  return middleware;
  
};
