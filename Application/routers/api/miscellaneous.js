const fs = require('fs');
const const_tips = require('./constants').const_tips;

const logStream = fs.createWriteStream("assets/log/" + new Date().toISOString().replace(/[T:.]/g, '-') + ".log", { flags: 'a' });

// Write log
const writeLog = (message) => {
    try {
        logStream.write(new Date().toISOString() + ": " + message.toString() + "\n");
    } catch (err) {
        console.log("While running writeLog(): ");
        console.error(err);
    }
}

const getVideoCode = (url) => {
    try {
        let res = url.substring(29);
        let i = 0;
        while (i < res.length && '0123456789'.indexOf(res[i]) !== -1) i += 1;
        return res.substring(0, i);
    } catch (err) {
        return "";
    }
}

const getTips = () => {
    return const_tips[Math.floor(Math.random() * const_tips.length)];
}

module.exports = { writeLog, getVideoCode, getTips };