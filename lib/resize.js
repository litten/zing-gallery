var fs = require('fs');
var nodePath = require('path');
var images = require('images');
var crypto = require('crypto');
var imagemin = require('imagemin');
var imageminJpegtran = require('imagemin-jpegtran');
var imageminPngquant = require('imagemin-pngquant');
var spawn = require('child_process').spawn;
var webpBinPath = require('webp-bin').path;

function walk(path, floor) {
	floor = floor || 0;
	handleFile(path, floor);
	floor++;
	fs.readdir(path, function(err, files) {
		if (err) {
			console.log('read dir error');
		} else {
			files.forEach(function(item) {
				var tmpPath = path + '/' + item;
				fs.stat(tmpPath, function(err1, stats) {
					if (err1) {
						console.log('stat error');
					} else {
						if (stats.isDirectory()) {
							walk(tmpPath, floor, handleFile);
						} else {
							handleFile(tmpPath, floor);
						}
					}
				})
			});

		}
	});
}

function handleFile(path, floor) {
	fs.stat(path, function(err1, stats) {
		if (err1) {
			console.log('stat error');
		} else {
			var extName = nodePath.extname(path).toLowerCase()
			if (stats.isDirectory()) {

			} else if (extName === '.jpg' || extName === '.png') {
				var md5Name = crypto.createHash('md5').update(nodePath.join(path)).digest('hex')
				var imgPath = './tmp/' + md5Name + '.jpg';
				var imgLargePath = './tmp_large/' + md5Name + '.jpg';
				var imgwebPPath = './tmp_webp/' + md5Name + '.webp';
				fs.exists(imgPath, function(exists) {
					if (!exists) {
						images(path)
							.resize(300)
							.save(imgPath, {
								quality: 100
							});
					}
				});

				fs.exists(imgLargePath, function (exists) {
					if (!exists) {
						images(path)
							.resize(621)
							.save(imgLargePath);
					}
				});

				// 文件名空格处理
				fs.exists(imgwebPPath, function (exists) {
					if (!exists) {
						var webpLine = path.replace(/\s/g, '%20') + ' -q 80 -o ./tmp_webp/' + md5Name + '.webp';
						var webpLineSplit = webpLine.split(/\s+/);
						var webpLineArr = [];
						for (var i = 0, len = webpLineSplit.length; i < len; i++) {
							webpLineArr.push(webpLineSplit[i].replace(/%20/g, ' '));
						}
						spawn(webpBinPath, webpLineArr);
					}
				});
			}
		}
	})
}

function minifiy() {
	imagemin(['./tmp/*.{jpg,png}'], './tmp', {
		plugins: [
			imageminJpegtran({ quality: '65-80' }),
			imageminPngquant({ quality: '65-80' })
		]
	});
}

module.exports = {
	init: function(path, floor) {
		var tmpPromise = new Promise(function(resolve, reject) {
			fs.exists('./tmp', function (exists) {
				if (!exists) {
					fs.mkdirSync('./tmp');
				}
				resolve();
			})
		});

		var tmpWebPPromise = new Promise(function (resolve, reject) {
			fs.exists('./tmp_webp', function (exists) {
				if (!exists) {
					fs.mkdirSync('./tmp_webp');
				}
				resolve();
			})
		});

		var tmpLargePromise = new Promise(function (resolve, reject) {
			fs.exists('./tmp_large', function (exists) {
				if (!exists) {
					fs.mkdirSync('./tmp_large');
				}
				resolve();
			})
		});

		Promise.all([tmpPromise, tmpWebPPromise, tmpLargePromise]).then(function() {
			walk(path, floor);
			minifiy();
		});
	}
}