exports.connectpattern = '%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} \\(%{IPV4:connectip}:%{NUMBER}\\) connected';
exports.disconnectpattern = '%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} disconnected';
exports.disconnectbynamepattern = '%{TIME:timestamp} Player %{GREEDYDATA:username} disconnected';
exports.beguidpattern = '%{TIME:timestamp} BattlEye Server: Player #%{NUMBER:connectid} %{GREEDYDATA:username} - GUID: %{GREEDYDATA:beguid}'
exports.steamidpattern = '%{TIME:timestamp} Player %{GREEDYDATA:username} connected \\(id=%{NUMBER:steamid}\\).'
exports.messagepattern = '%{TIME:timestamp} BattlEye Server: \\(%{WORD:channel}\\) %{DATA:username}: %{GREEDYDATA:message}'
exports.datepattern = '%{GREEDYDATA}/%{DATE_EU:date}/%{DATA:time}/%{GREEDYDATA}'
exports.timepattern = '%{TIME:timestamp}%{GREEDYDATA}';
