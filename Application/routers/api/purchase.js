const express = require('express');
const router = express.Router();

const miscellaneous = require('./miscellaneous');
const database = require('./database');

router.post('/', async (req, res) => {
    database.appendPurchase(req.body.clientID, req.body.jwt, req.body.cartId, req.body.orderId);
    console.log("Received a purchase from " + req.body.clientID);
    miscellaneous.writeLog("Received a purchase from " + req.body.clientID);

    res.sendStatus(200);
});

module.exports = router;