const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    console.log("Sent privacy policy!");
    res.sendFile("sites/privacy_policy.html", { root: __dirname });
});

module.exports = router;