var fs = require('fs');
var path = require('path');
var logFilePath = path.resolve(process.cwd(), process.env.LOG_FILEPATH || './logfile.log');
var fd = require('fs').createReadStream(logFilePath);
var lineReader = require('readline').createInterface({
  input: fd
});

var offset = fs.fstatSync(fs.openSync(logFilePath)).size;

console.log(logFilePath);

lineReader.on('line', function (line) {
  console.log('Line from file:', line);
});

lineReader.on('close', function () {
  fs.watchFile(logFilePath, (prev, curr) => {
    if(prev.mtime === curr.mtime){
      return;
    }

    fs.openFile(logFilePath, function(err, fd){
    	if (err) {
    		console.error('error to read file');
    		return;
    	}



    	var bufferLength = fs.fstatSync(fd).size - offset;

    	var buffer = Buffer.allocUnsafe(bufferLength)
    	fs.read(fd, buffer, 0, bufferLength, offset, function(err, bytesRead, buffer) {
    		if(err) {
    			console.error('error to read file to buffer');
    			return;
    		}
    		lineReader._normalWrite(buffer);
    	})
    })
  })
});


