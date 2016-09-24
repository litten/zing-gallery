var fs = require('fs'),
	nodePath = require('path'),
	images = require('images'),
	crypto = require('crypto');

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
				fs.exists(imgPath, function(exists) {
					if (!exists) {
						images(path)
							.size(150)
							.save(imgPath, {
								quality: 80
							});
					}
				});
			}
		}
	})
}

module.exports = {
	init: function(path, floor) {
		fs.exists('./tmp', function(exists) {
			if (!exists) {
				fs.mkdirSync('./tmp');
			}
			walk(path, floor);
		})
	}
}