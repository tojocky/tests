var WebClient = require('@slack/client').WebClient;
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var fs = require('fs');
var path = require('path');

var logFilePath = path.resolve(process.cwd(), process.env.LOG_FILEPATH || './logfile.log');

/*
var fd = require('fs').createReadStream(logFilePath);
var lineReader = require('readline').createInterface({
  output: fd
});
*/

var token = process.env.SLACK_API_TOKEN || '';
var web = new WebClient(token);
var logFilePath = process.env.LOG_FILEPATH || './logfile.log';

web.team.info(function teamInfoCb(err, info) {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Team Info:', info);
  }
});

var rtm = new RtmClient(token, { logLevel: 'error' });
rtm.start();

// subscribe to all RTM events
event_keys = Object.keys(RTM_EVENTS);


function writeToFile(data) {
	fs.appendFile(logFilePath, JSON.stringify(data) + '\n', function(err) {
		if(err) {
			console.error('error to write log in ', logFilePath);
		}
	});
};

event_keys.forEach(function(keyName){
	var keyValue = RTM_EVENTS[keyName];
	console.log("subscribing to event key " + keyName + ": " + keyValue);
	rtm.on(keyValue, writeToFile);
});
