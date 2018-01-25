var patterns    = require('node-grok').loadDefaultSync();

exports.connect = patterns.createPattern('%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} \\(%{IPV4:connectip}:%{NUMBER}\\) connected');
exports.disconnect = patterns.createPattern('%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} disconnected');
exports.disconnectbyname = patterns.createPattern('%{TIME:timestamp} Player %{GREEDYDATA:username} disconnected');
exports.beguid = patterns.createPattern('%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} - GUID: %{GREEDYDATA:beguid}');
exports.steamid = patterns.createPattern('%{TIME:timestamp} Player %{GREEDYDATA:username} connected \\(id=%{NUMBER:steamid}\\).');
exports.message = patterns.createPattern('%{TIME:timestamp} BattlEye Server: \\(%{WORD:channel}\\) %{DATA:username}: %{GREEDYDATA:message}');
exports.date = patterns.createPattern('%{GREEDYDATA}/%{DATE_EU:date}/%{DATA:time}/%{GREEDYDATA}');
exports.time = patterns.createPattern('%{TIME:timestamp}%{GREEDYDATA}');
