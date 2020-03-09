const express = require('express');
const router = express.Router();

const miscellaneous = require('./miscellaneous');
const database = require('./database');

router.post('/', async (req, res) => {
    database.updateStatus(req.body.clientID, req.body.license);
    console.log("Updating status of " + req.body.clientID);
    miscellaneous.writeLog("Updating status of " + req.body.clientID);

    res.sendStatus(200);
});

module.exports = router;