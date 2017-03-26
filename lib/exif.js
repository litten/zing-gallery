var ExifImage = require('exif').ExifImage;

/*
 * Utility function to convert exif data into something a bit more consumable
 * by a template
 */
var exif = function(staticPath, callback){
  try {
    new ExifImage({
      image : staticPath//'resources/photos/Ireland/West Coast/_MG_4174.jpg'
    }, function (error, data) {

      if (error){
        return callback(null, null);
      }else{
        var exifMap = {
          // 相机型号
          "Model": data.image.Model || '', 
          // 生成时间                   
          "Time": data.exif.DateTimeOriginal || 0,    
          // 光圈F值       
          "FNumber": data.exif.FNumber || '',   
          // 焦距                        
          "focalLength": data.exif.FocalLength || '',
          // 感光度
          "ISO": data.exif.ISO || '',
          // 快门速度
          "speed": ('1/' + (2^data.exif.ShutterSpeedValue)) || '',
          // 闪光灯
          "Flash": data.exif.Flash || '',
          // 曝光程序 - 自动曝光、光圈优先、快门优先、M档等
          "ExposureProgram": data.exif.ExposureProgram || '',
          // 白平衡
          "WhiteBalance": data.exif.WhiteBalance || ''
        }
        return callback(null, exifMap);
      }
    });
  } catch (error) {
    return callback(null, null);
  }
}

// source: http://stackoverflow.com/questions/95727/how-to-convert-floats-to-human-readable-fractions
function dec2frac(d) {
  var df = 1;
  var top = 1;
  var bot = 1;

  while (df != d) {
    if (df < d) {
      top += 1;
    }
    else {
      bot += 1;
      top = parseInt(d * bot);
    }
    df = top / bot;
  }
  return top + '/' + bot;
}

module.exports = exif;
