const express = require('express');
const router = express.Router();

const writeLog = require('./miscellaneous').writeLog;

const appendPurchase = require('./database').appendPurchase;

router.post('/', async (req, res) => {
    appendPurchase(req.body.clientID, req.body.jwt, req.body.cartId, req.body.orderId);
    console.log("Received a purchase from " + req.body.clientID);
    writeLog("Received a purchase from " + req.body.clientID);

    res.sendStatus(200);
});

module.exports = router;