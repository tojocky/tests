var fs = require('fs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;

var logFilePath = process.env.LOG_FILEPATH || path.join(process.cwd(), 'logfile.log');
var mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/test';
var lineReader = require('readline').createInterface({
  input: fs.createReadStream(logFilePath)
});

var offsetLogs = fs.fstatSync(fs.openSync(logFilePath, 'r')).size;
var mongoConnection = null;

function getDBConnection() {
	if(mongoConnection) {
		return mongoConnection;
	}
    mongoConnection = MongoClient.connect(mongoUrl);
    return mongoConnection;
};

lineReader.on('line', function (line) {
	var message = JSON.parse(line);
  	console.log('Line from file:', message);
  	// insert into db
  	getDBConnection().then(function(db) {
  		return db.collection('slackLogs').insertOne(message);
  	}).then(function(result) {
  		console.log('inserted');
  	}, function(err) {
  		console.error('error to insert into mongo', err);
  	})
});

lineReader.on('close', function () {
  fs.watchFile(logFilePath, (prev, curr) => {
    if(prev.mtime === curr.mtime){
      return;
    }

    fs.open(logFilePath, 'r', function(err, fd){
    	if (err) {
    		console.error('error to read file');
    		return;
    	}

    	var bufferLength = fs.fstatSync(fd).size - offsetLogs;
    	var buffer = Buffer.allocUnsafe(bufferLength)
    	fs.read(fd, buffer, 0, bufferLength, offsetLogs, function(err, bytesRead, buffer) {
    		if(err) {
    			console.error('error to read file to buffer');
    			return;
    		}
    		offsetLogs += bytesRead;
    		lineReader._normalWrite(buffer);
    	})
    })
  })
});


