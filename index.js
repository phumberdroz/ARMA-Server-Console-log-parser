var filefinder = require("./filefinder");
const pattern = require('./patterns');
const Promise = require('bluebird');
const _ = require('lodash');
const db = require("./models/index");

// Promise.config({
//     // Enable warnings
//     warnings: true,
//     // Enable long stack traces
//     longStackTraces: true,
//     // Enable cancellation
//     cancellation: true,
//     // Enable monitoring
//     monitoring: true
// });


db.sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1)
    });

let files = [];
const fs = require('fs');
filefinder.fromDir(process.env.NODE_ENV === 'production' ? '../logs' : process.env.LogFolder , /server_console\.log$/, function (filename) {
    files.push(filename);
});


files = _.map(files, (file) => {
    return {
        filename: file,
        lines: fs.readFileSync(file).toString().split('\r\n')
    }
});
// console.dir(files);
console.group('start parsing');
parseddata = _.chain(files) //.slice(0,10)
    .filter(file => {
        return file.lines.length > 1;
    })
    .map((file) => {
        return parseFile(file)
    })
    .value();


Promise.all(parseddata)
    .then(res => {
        console.groupEnd();
        delete files;
        console.log('Parsed %d files', files.length);
        const sessions = _.chain(res)
            .map('sessions')
            .flatten()
            .filter(session => {
                return session.beguid.length === 32
            })
            .map(session => {
                return {
                    steamid: session.steamid,
                    beguid: session.beguid,
                    ip: session.connectip,
                    username: session.username,
                    connect: session.connect,
                    disconnect: session.disconnect,
                    connectadj: session.connectadj,
                    disconnectadj: session.disconnectadj,
                    file: session.file,
                    conline: session.conline,
                    disline: session.disline,
                }
            })
            .chunk(250)
            .value();

        const messages = _.chain(res)
            .map('messages')
            .flatten()
            .map(message => {
                return {
                    username: message.username,
                    ip: message.connectip,
                    steamid: message.steamid,
                    time: message.time,
                    beguid: message.beguid,
                    message: message.message,
                    channel: message.channel,
                }
            })
            .chunk(250)
            .value();
        console.group('DB Transactions start');
        console.log('importing ~%d sessions', (sessions.length * 250));
        console.log('importing ~%d messages', (messages.length * 250));
        return Promise.resolve()
            .then(() => {
                return _.flatten([
                    Promise.reduce(messages, (a, chunk) => {
                        return db.messages.bulkCreate(chunk,{ignoreDuplicates: true});
                        // return Promise.map(chunk, e => {
                        //     db.messages.findCreateFind({
                        //         where: e
                        //     })
                        // })
                    }),
                    Promise.reduce(sessions, (a, chunk) => {
                        return db.sessions.bulkCreate(chunk,{ignoreDuplicates: true});
                        // return Promise.map(chunk, e => {
                        //     // console.log(e);
                        //     return db.sessions.findCreateFind({
                        //         where: e
                        //     })
                        // })
                    }),
                ]);
            })
            .all()
            .then(() => {
                console.log('DB Transctions finished');
                console.groupEnd();
                return 'finished'
            })

        // return Promise.resolve()
        //     .then(() => {
        //         return [
        //             _.chain(messages)
        //                 .chunk(250)
        //                 .map(chunk => {
        //                     console.log(chunk)
        //                     return db.messages.bulkCreate(chunk,{raw: true})
        //                         .then(e => {
        //                             return e;
        //                         })
        //                 })
        //                 .value(),
        //             _.chain(sessions)
        //                 .chunk(250)
        //                 .map(chunk => db.sessions.bulkCreate(chunk,{raw: true}))
        //                 .value(),
        //         ]
        //     }).all()
    })
    .then(() => {
        console.log('import finished');
        process.exit(0);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });


/* PARSING SHIT */

function parseFile(fileObject) {
    return new Promise((resolve, reject) => {
        console.log('currently parsing %s', fileObject.filename);
        let sessions = [];
        let messages = [];
        let lasttime;

        let filestamp = pattern.date.parseSync(fileObject.filename);

        filestamp.date = filestamp.date.split(".")[2] + "." + (filestamp.date.split(".")[1]) + "." + filestamp.date.split(".")[0];
        filestamp.time = filestamp.time.replace(/_/g, ":");
        filestamp.fileDate = new Date(filestamp.date + " " + filestamp.time);

        _.each(fileObject.lines, line => {
            if (pattern.connect.parseSync(line)) {
                tmp = pattern.connect.parseSync(line);
                sessions.unshift({
                    username: tmp.username,
                    connectid: tmp.connectid,
                    connectip: tmp.connectip,
                    connect: new Date((filestamp.date + " " + tmp.timestamp)).toISOString(),
                    disconnect: '',
                    steamid: '',
                    beguid: '',
                    conline: line,
                    file: fileObject.filename,
                });
            } else if (pattern.disconnect.parseSync(line)) {
                const tmp = pattern.disconnect.parseSync(line);

                const session = sessions.findIndex((session) => session.connectid === tmp.connectid);
                sessions[session].disconnect = new Date((filestamp.date + " " + tmp.timestamp)).toISOString();
                sessions[session].disline = line;
            } else if (pattern.disconnectbyname.parseSync(line)) {
                const tmp = pattern.disconnectbyname.parseSync(line);

                const session = sessions.findIndex((session) => session.username === tmp.username);
                sessions[session].disconnect = new Date((filestamp.date + " " + tmp.timestamp)).toISOString();
                sessions[session].disline = line;
            } else if (pattern.beguid.parseSync(line)) {
                const tmp = pattern.beguid.parseSync(line);

                const session = sessions.findIndex((session) => session.connectid === tmp.connectid);
                sessions[session].beguid = tmp.beguid;
            } else if (pattern.steamid.parseSync(line)) {
                const tmp = pattern.steamid.parseSync(line);

                const session = sessions.findIndex((session) => session.username === tmp.username);
                if (session !== -1) {
                    sessions[session].steamid = tmp.steamid;
                }
            } else if (pattern.message.parseSync(line)) {
                const tmp = pattern.message.parseSync(line);

                const session = sessions.findIndex((session) => session.username === tmp.username);
                messages.unshift({
                    username: sessions [session].username,
                    connectip: sessions [session].connectip,
                    steamid: sessions [session].steamid,
                    time: new Date(filestamp.date + " " + tmp.timestamp).toISOString(),
                    beguid: sessions [session].beguid,
                    message: tmp.message,
                    channel: tmp.channel,
                });
            }
            if (pattern.time.parseSync(line)) {
                const newtime = pattern.time.parseSync(line).timestamp;

                if (!lasttime || newtime > lasttime || (newtime.split(":")[0] === "0" && lasttime.split(":")[0] === "23")) {
                    lasttime = newtime;
                }

            }
        });
        if (lasttime) {
            filestamp.lastdate = new Date((filestamp.date + " " + lasttime)).toISOString();
        }
        _.map(sessions, (session) => {
            const connecttime = new Date(session.connect);
            const disconnecttime = new Date(session.disconnect);

            if (!session.disconnect) {
                session.disconnect = filestamp.lastdate;
                session.disline = "HANDMADE"
            }

            if (filestamp.fileDate < connecttime) {
                session.connect = connecttime.setDate(connecttime.getDate() - 1);
                session.connectadj = true
            }
            if (filestamp.fileDate < disconnecttime) {
                session.disconnect = disconnecttime.setDate(disconnecttime.getDate() - 1);
                session.disconnectadj = true
            }
            return session;
        });

        _.map(messages, message => {
            const message_time = new Date(message.time);

            if (filestamp.fileDate < message_time) {
                message.time = message_time.setDate(message_time.getDate() - 1);
            }
            return message;
        });
        console.log('finshed parsing %s', fileObject.filename);
        return resolve({messages: messages, sessions: sessions});
    })
}