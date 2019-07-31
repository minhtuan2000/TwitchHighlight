const express = require('express')
const app = express()
const port = 3000

app.use(express.json());
app.use('/api/link', require('./routers/api/link'));
app.use('/api/report', require('./routers/api/report'));

app.get('/*', function (req, res) {
    res.sendStatus(404);
});

app.listen(port, () => console.log(`App listening on port ${port}!`))