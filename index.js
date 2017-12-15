var filefinder  = require("./filefinder");
var lineReader  = require('line-reader');
var mysql       = require('mysql');
var patterns    = require('node-grok').loadDefaultSync();
var filepatterns   = require('./patterns')
var Promise     = require('bluebird');
files = [];
filefinder.fromDir('../logs',/server_console\.log$/,function(filename){
    files.push(filename);
});

var connect           = patterns.createPattern(filepatterns.connectpattern);
var disconnect        = patterns.createPattern(filepatterns.disconnectpattern);
var disconnectbyname  = patterns.createPattern(filepatterns.disconnectbynamepattern);
var beguid            = patterns.createPattern(filepatterns.beguidpattern);
var steamid           = patterns.createPattern(filepatterns.steamidpattern);
var message           = patterns.createPattern(filepatterns.messagepattern);
var date              = patterns.createPattern(filepatterns.datepattern);
var time              = patterns.createPattern(filepatterns.timepattern);

sessions = [];
messages = [];
counter=0;
adjusted=0;

var connection  = mysql.createPool({
  connectionLimit : 20,
  host     : 'localhost',
  user     : 'root',
  password : 'toor',
  database : 'gadget'
});


connection.query('TRUNCATE sessions');
connection.query('TRUNCATE messages');

function saveSessions (pSessions) {
    pSessions.map(session => {

      if (session.beguid.length != 32){
        return false;
      }

      connection.query('INSERT INTO sessions SET ?', {
        steamid: session.steamid,
        beguid: session.beguid,
        ip: session.connectip,
        username: session.username,
        connect: new Date(session.connect).toISOString().slice(0, 19).replace('T', ' '),
        disconnect: new Date(session.disconnect).toISOString().slice(0, 19).replace('T', ' '),
        connectadj: session.connectadj,
        disconnectadj: session.disconnectadj,
        file: session.file,
        conline: session.conline,
        disline: session.disline,
      }, function (error, results, fields) {
        if (error) throw error;
        if (results.insertId%100==0) console.log("current insert " + results.insertId);
      });
    })
}

function saveMessages (pMessages) {
    pMessages.map(message => {
      connection.query('INSERT INTO messages SET ?', {
        username: message.username,
        ip: message.connectip,
        steamid: message.steamid,
        time: new Date(message.time).toISOString().slice(0, 19).replace('T', ' '),
        beguid:  message.beguid,
        message:  message.message,
        channel:  message.channel,
      }, function (error, results, fields) {
        if (error) throw error;
        if (results.insertId%100==0) console.log("current message insert " + results.insertId);
      });
    })
}


var eachLine = Promise.promisify(lineReader.eachLine);
Promise.map(files,(file,i) =>{
  sessions[i]=[]
  messages[i]=[]
  lasttime = "";
  lasttimes=[];
  eachLine(file, function(line,last) {
    timestamp=date.parseSync(file)
    timestamp.date = timestamp.date.split(".")[2]+"."+(timestamp.date.split(".")[1])+"."+timestamp.date.split(".")[0];
    if (connect.parseSync(line)) {
      tmp = connect.parseSync(line);
      sessions[i].unshift({
        username: tmp.username,
        connectid: tmp.connectid,
        connectip: tmp.connectip,
        connect: new Date(timestamp.date + " " + tmp.timestamp).toISOString(),
        disconnect: '',
        steamid: '',
        beguid: '',
        conline: line,
        file: file,
      });
    } else if (disconnect.parseSync(line)) {
      tmp = disconnect.parseSync(line);
      const session = sessions[i].findIndex((session) => session.connectid === tmp.connectid);
      sessions[i][session].disconnect = new Date(timestamp.date + " " + tmp.timestamp).toISOString();
      sessions[i][session].disline    = line;
    } else if (disconnectbyname.parseSync(line)) {
      tmp = disconnectbyname.parseSync(line);
      const session = sessions[i].findIndex((session) => session.username === tmp.username);
      sessions[i][session].disconnect = new Date(timestamp.date + " " + tmp.timestamp).toISOString();
      sessions[i][session].disline    = line;
    } else if (beguid.parseSync(line)) {
      tmp = beguid.parseSync(line);
      const session = sessions[i].findIndex((session) => session.connectid === tmp.connectid);
      sessions[i][session].beguid=tmp.beguid;
    } else if (steamid.parseSync(line)) {
      tmp = steamid.parseSync(line);
      const session = sessions[i].findIndex((session) => session.username === tmp.username);
      if (session != -1) {
        sessions[i][session].steamid=tmp.steamid;
      }
    } else if (message.parseSync(line)) {
      tmp = message.parseSync(line);
      const session = sessions[i].findIndex((session) => session.username === tmp.username);
      messages[i].unshift({
        username: sessions[i][session].username,
        connectip: sessions[i][session].connectip,
        steamid: sessions[i][session].steamid,
        time: new Date(timestamp.date + " " + tmp.timestamp).toISOString(),
        beguid:  sessions[i][session].beguid,
        message:  tmp.message,
        channel:  tmp.channel,
      });
    }
    if (time.parseSync(line)) {
      var newtime =time.parseSync(line).timestamp

      if (!lasttimes[i] || newtime > lasttimes[i] || (newtime.split(":")[0]=="0" && lasttimes[i].split(":")[0]=="23")) {
        lasttimes[i] = newtime;
      }

    }
    if (last){
      sessions[i].map((session, index) => {
        if (session.disconnect == ""){
          session.disconnect=new Date(timestamp.date + " " + lasttimes[i]).toISOString();
          session.disline="HANDMADE"
        }
        fileDate=new Date(timestamp.date + " " + timestamp.time.replace(/_/g, ":"))
        connecttime=new Date(session.connect);
        disconnecttime=new Date(session.disconnect);
        if (fileDate<connecttime){
          session.connect = connecttime.setDate(connecttime.getDate() - 1);
          session.connectadj = true
        }
        if (fileDate<disconnecttime){
          session.disconnect = disconnecttime.setDate(disconnecttime.getDate() - 1);
          session.disconnectadj = true
        }
        return session;
      })
      messages[i].map((message, index) => {
        fileDate=new Date(timestamp.date + " " + timestamp.time.replace(/_/g, ":"))
        message_time=new Date(message.time);
        if (fileDate<message_time){
          message.time = message_time.setDate(message_time.getDate() - 1);
        }
        return message;
      })
      counter++;
      console.log("finished " + file)
      console.log("current sessions " + sessions[i].length)
    }
    return line;
  }).then(function() {
    saveMessages(messages[i])
    saveSessions(sessions[i])
    //console.log('done ' + counter);
  }).catch(function(err) {
    console.error(err);
  })}
)
