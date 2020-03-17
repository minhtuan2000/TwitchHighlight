const express = require('express');
const app = express();
const port = 3000;

const updateIPAddress = require('./routers/api/database').updateIPAddress;

app.use(express.json());
app.use('/api/link', require('./routers/api/link'));
app.use('/api/report', require('./routers/api/report'));
app.use('/api/purchase', require('./routers/api/purchase'));
app.use('/api/status', require('./routers/api/status'));
app.use('/terms', require('./routers/api/terms'));
app.use('/privacy', require('./routers/api/privacy'));

app.get('/*', function (req, res) {
    res.sendStatus(404);
});

app.listen(port, () => {
    updateIPAddress();
    console.log(`App listening on port ${port}!`);
    // Set timer for self-destruct in 1 day
    setTimeout(() => {
        console.log("Restarting...");
        process.exit();
    }, 24 * 60 * 60 * 1000);
});