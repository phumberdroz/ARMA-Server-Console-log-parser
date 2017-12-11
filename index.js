var filefinder = require("./filefinder");
var lineReader = require('line-reader');
var mysql      = require('mysql');
var patterns   = require('node-grok').loadDefaultSync();

console.log(filefinder.fromDir);
files = [];
filefinder.fromDir('../logs',/server_console\.log$/,function(filename){
    files.push(filename);
});

var connectpattern = '%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} \\(%{IPV4:connectip}:%{NUMBER}\\) connected';
var disconnectpattern = '%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} disconnected';
var beguidpattern = '%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} - GUID: %{GREEDYDATA:beguid}'
var steamidpattern = '%{TIME:timestamp} Player %{GREEDYDATA:username} connected \\(id=%{NUMBER:steamid}\\).'
var messagepattern = '%{TIME:timestamp} BattlEye Server: \\(%{WORD:channel}\\) %{GREEDYDATA:username}: %{GREEDYDATA:message}'
var datepattern = '%{GREEDYDATA}%{DATE_EU:date}/%{DATA:time}/%{GREEDYDATA}'
var timepattern = '%{TIME:timestamp}%{GREEDYDATA}';


var connect     = patterns.createPattern(connectpattern);
var disconnect  = patterns.createPattern(disconnectpattern);
var beguid      = patterns.createPattern(beguidpattern);
var steamid     = patterns.createPattern(steamidpattern);
var message     = patterns.createPattern(messagepattern);
var date        = patterns.createPattern(datepattern);
var time        = patterns.createPattern(timepattern);
sessions = [];
counter=0
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'toor',
  database : 'gadget'
});

connection.connect();


function callback () {
  for (var i = 0; i < sessions.length; i++) {
    connection.query('INSERT INTO sessions SET ?', {
      steamid: sessions[i].steamid,
      beguid: sessions[i].beguid,
      ip: sessions[i].connectip,
      connect: new Date(sessions[i].connecttime).toISOString().slice(0, 19).replace('T', ' '),
      disconnect: new Date(sessions[i].disconnecttime).toISOString().slice(0, 19).replace('T', ' '),
      username: sessions[i].username,
    }, function (error, results, fields) {
      if (error) throw error;
    });
  }
}
timestamps=[]
for (var i = 0; i < files.length; i++) {
  timestamp = date.parseSync(files[i]);
  timestamp.date =timestamp.date.split(".")[2]+"."+(timestamp.date.split(".")[1]-1)+"."+timestamp.date.split(".")[0];
  timestamps.push(timestamp)
}
for (var x = 0; x < files.length; x++) {
  lasttime = "";
  lineReader.eachLine(files[x], function(line, last) {
    if (connect.parseSync(line)) {
      tmp = connect.parseSync(line);
      sessions.unshift({
        username: tmp.username,
        connecttime: new Date(timestamps[counter].date + " " + tmp.timestamp),
        disconnecttime: "",
        connectid: tmp.connectid,
        connectip: tmp.connectip,
        steamid: "",
        beguid: ""
      });
    } else if (disconnect.parseSync(line)) {
      tmp = disconnect.parseSync(line);
      const session = sessions.findIndex((session) => session.connectid === tmp.connectid);
      sessions[session].disconnecttime=new Date(timestamps[counter].date + " " + tmp.timestamp);
    } else if (beguid.parseSync(line)) {
      tmp = beguid.parseSync(line);
      const session = sessions.findIndex((session) => session.connectid === tmp.connectid);
      sessions[session].beguid=tmp.beguid;
    } else if (steamid.parseSync(line)) {
      tmp = steamid.parseSync(line);
      const session = sessions.findIndex((session) => session.username === tmp.username);
      if (session != -1) {
        sessions[session].steamid=tmp.steamid;
      }
    }

    if (time.parseSync(line)) {
        lasttime = time.parseSync(line).timestamp
    }

    if (last){
      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].disconnecttime== ""){
          sessions[i].disconnecttime=new Date(timestamps[counter].date + " " + lasttime);
        }
        fileDate=new Date(timestamps[counter].date + " " + timestamp.time.replace(/_/g, ":"))
        connecttime=new Date(sessions[i].connecttime);
        if (fileDate<connecttime){
          sessions[i].connecttime = connecttime.setDate(connecttime.getDate() - 1);
        }
        disconnecttime=new Date(sessions[i].disconnecttime);
        if (fileDate<disconnecttime){
          sessions[i].disconnecttime = disconnecttime.setDate(disconnecttime.getDate() - 1);
        }
      }
      console.log("finished" + files[counter])
      console.log("current sessions " + sessions.length)
      counter++
      if(counter === files.length) {
        callback();
      }
    }
  });
}
