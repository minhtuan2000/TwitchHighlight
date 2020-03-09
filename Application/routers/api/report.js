const express = require('express');
const router = express.Router();

const miscellaneous = require('./miscellaneous');
const database = require('./database');

router.post('/', async (req, res) => {
    database.appendReport(req.body.clientID, req.body.url, req.body.email, req.body.message);
    console.log("Received a report from " + req.body.clientID);
    miscellaneous.writeLog("Received a report from " + req.body.clientID);

    res.sendStatus(200);
});

module.exports = router;