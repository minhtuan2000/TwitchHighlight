const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    console.log("Sent terms and conditions!");
    res.sendFile('sites/terms.html', { root: __dirname });
});

module.exports = router;