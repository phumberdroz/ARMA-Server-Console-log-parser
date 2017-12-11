var filefinder = require("./filefinder");
var lineReader = require('line-reader');
var mysql      = require('mysql');
var patterns   = require('node-grok').loadDefaultSync();
var filepatterns   = require('./patterns')

console.log(filefinder.fromDir);
files = [];
filefinder.fromDir('../logs',/server_console\.log$/,function(filename){
    files.push(filename);
});

var connect     = patterns.createPattern(filepatterns.connectpattern);
var disconnect  = patterns.createPattern(filepatterns.disconnectpattern);
var beguid      = patterns.createPattern(filepatterns.beguidpattern);
var steamid     = patterns.createPattern(filepatterns.steamidpattern);
var message     = patterns.createPattern(filepatterns.messagepattern);
var date        = patterns.createPattern(filepatterns.datepattern);
var time        = patterns.createPattern(filepatterns.timepattern);

sessions = [];
counter=0
adjusted=0;
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
      username: sessions[i].username,
    }, function (error, results, fields) {
      if (error) throw error;
      if (results.insertId%100==0) console.log("current insert " + results.insertId);

    });
  }
}

for (var x = 0; x < files.length; x++) {
  lineReader.eachLine(files[x], function(line, last) {
    if (connect.parseSync(line)) {
      tmp = connect.parseSync(line);
      sessions.unshift({
        username: tmp.username,
        connectid: tmp.connectid,
        connectip: tmp.connectip,
        steamid: "",
        beguid: "",
      });
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

    if (last){

      counter++

      console.log("finished " + files[counter])
      console.log("current sessions " + sessions.length)
      console.log("current adjustments " + adjusted)
      if(counter === files.length) {
        callback();
      }
    }
  });
}
