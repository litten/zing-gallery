var fs = require('fs'),
	nodePath = require('path'),
	imk = require('imagemagick')
	images = require('images')

function walk(path, floor, handleFile) {
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
			// } else if (nodePath.basename(path) === 'IMG_0177.jpg') {
				/*imk.resize({
					srcPath: path,
					dstPath: './tmp/s_' + nodePath.basename(path),
					width: 256
				}, function(err, stdout, stderr) {
					console.log(err)
					if (err) throw err;
					console.log('resized kittens.jpg to fit within 256x256px');
				});*/
				images(path)                     //Load image from file 
				                                        //加载图像文件
				    .size(200)                          //Geometric scaling the image to 400 pixels width
				                                        //等比缩放图像到400像素宽
				    // .draw(images("logo.png"), 10, 10)   //Drawn logo at coordinates (10,10)
				                                        //在(10,10)处绘制Logo
				    .save('./tmp/s_' + nodePath.basename(path), {               //Save the image to a file,whih quality 50
				        quality : 100                    //保存图片到文件,图片质量为50
				    });
			}
		}
	})
}

walk('./resources/photos', 0, handleFile)