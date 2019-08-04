const express = require('express');
const router = express.Router();

const writeLog = require('./miscellaneous').writeLog;

const updateStatus = require('./database').updateStatus;

router.post('/', async (req, res) => {
    updateStatus(req.body.clientID, req.body.license);
    console.log("Updating status of " + req.body.clientID);
    writeLog("Updating status of " + req.body.clientID);

    res.sendStatus(200);
});

module.exports = router;