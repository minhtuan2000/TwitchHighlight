const express = require('express');
const router = express.Router();

const writeLog = require('./miscellaneous').writeLog;

const appendReport = require('./database').appendReport;

router.post('/', async (req, res) => {
    appendReport(req.body.clientID, req.body.url, req.body.email, req.body.message);
    console.log("Received a report from " + req.body.clientID);
    writeLog("Received a report from " + req.body.clientID);

    res.sendStatus(200);
});

module.exports = router;