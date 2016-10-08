var fs = require('fs')

// TODO: use config
var tempPath = './tmp'
fs.exists(tempPath, function(exists) {
	if (exists) {
		fs.unlink(tempPath, function(err) {
			console.log(err)
		});
	}
})