const express = require('express')
const app = express()
const port = 3000

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

app.listen(port, () => console.log(`App listening on port ${port}!`));