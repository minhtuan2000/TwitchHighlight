const writeLog = require('./miscellaneous').writeLog;
const getVideoCode = require('./miscellaneous').getVideoCode;
const constants = require('./constants');

const http = require('http');
const MongoClient = require('mongodb').MongoClient;
let _db;

const connectMongoDB = async () => {
    if (_db) {
        console.log("Warning: Reconnecting to database");
        writeLog("Warning: Reconnecting to database");
        try {
            const uri = "mongodb+srv://visualnick:FcWeaD5YXLcXml1A@twitchhighlights-sslwa.gcp.mongodb.net/test?retryWrites=true&w=majority";
            let client = new MongoClient(uri, { useNewUrlParser: true });
            await client.connect();
            _db = client.db("TwitchHighlightsDB");
            console.log("Successfully reconnected to database");
            writeLog("Successfully reconnected to database");
        } catch (err) {
            console.log("While trying to reconnect to database:");
            console.log(err);
            writeLog("While trying to reconnect to database: " + err.toString());
        }
    } else {
        try {
            const uri = "mongodb+srv://visualnick:FcWeaD5YXLcXml1A@twitchhighlights-sslwa.gcp.mongodb.net/test?retryWrites=true&w=majority";
            let client = new MongoClient(uri, { useNewUrlParser: true });
            await client.connect();
            _db = client.db("TwitchHighlightsDB");
            console.log("Successfully connected to database");
            writeLog("Successfully connected to database");
        } catch (err) {
            console.log("While trying to connect to database:");
            console.log(err);
            writeLog("While trying to connect to database: " + err.toString());
        }
    }
}

const getMongoDB = async () => {
    if (_db) return _db;
    else {
        await connectMongoDB();
        return _db;
    }
}

const activateAccount = async (clientID) => {
    try {
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: { IsActivated: true }
        });
    } catch (err) {
        console.log("While activating account:");
        console.error(err);
        writeLog("While activating account: " + err.toString());
    }
}

const deactivateAccount = async (clientID) => {
    try {
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: { IsActivated: false }
        });
    } catch (err) {
        console.log("While deactivating account:");
        console.error(err);
        writeLog("While deactivating account: " + err.toString());
    }
}

const upgradeAccount = async (clientID, expireDate) => {
    try {
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: { IsPremium: true, PremiumExpireDate: expireDate }
        });
    } catch (err) {
        console.log("While upgrading account:");
        console.error(err);
        writeLog("While upgrading account: " + err.toString());
    }
}

const downgradeAccount = async (clientID) => {
    try {
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: { IsPremium: false }
        });
    } catch (err) {
        console.log("While downgrading account:");
        console.error(err);
        writeLog("While downgrading account: " + err.toString());
    }
}

const checkExpiredAccount = async (clientID, expireDate) => {
    // Check if an account has expired:
    if (expireDate == null || expireDate.getTime() < new Date().getTime()) {
        // Expired
        console.log("Client " + clientID + " has expired");
        writeLog("Client " + clientID + " has expired");
        downgradeAccount(clientID);
    }
}

const isPremium = async (clientID) => {
    try {
        //Read from MongoDB
        let db = await getMongoDB();
        let res = await db.collection("Client").find({
            ClientID: clientID
        }).toArray();

        return [res[0].IsPremium, res[0].IsActivated];

    } catch (err) {
        console.log("While checking premium: ");
        console.error(err);
        writeLog("While checking premium: " + err.toString());
        // Default return false
        return [false, false];
    }
}

const getPendingCount = async (clientID, url) => {
    try {
        if (url != null) url = 'https://www.twitch.tv/videos/' + getVideoCode(url);

        // Reading from MongoDB
        let res = null;
        let lastHour = new Date();
        lastHour.setHours(lastHour.getHours() - 1);
        let db = await getMongoDB();
        if (url != null) {
            res = await db.collection("RequestLog").aggregate([
                {
                    $group: {
                        _id: { VideoURL: "$VideoURL", ClientID: "$ClientID" },
                        ClientID: { $last: "$ClientID" },
                        VideoURL: { $last: "$VideoURL" },
                        RequestDate: { $last: "$RequestDate" },
                        Status: { $last: "$Status" }
                    }
                },
                {
                    $match: {
                        RequestDate: { $gte: lastHour },
                        ClientID: clientID,
                        Status: "Processing",
                        VideoURL: { $ne: url }
                    }
                }
            ]).toArray();
        } else {
            res = await db.collection("RequestLog").aggregate([
                {
                    $group: {
                        _id: { VideoURL: "$VideoURL", ClientID: "$ClientID" },
                        ClientID: { $last: "$ClientID" },
                        VideoURL: { $last: "$VideoURL" },
                        RequestDate: { $last: "$RequestDate" },
                        Status: { $last: "$Status" }
                    }
                },
                {
                    $match: {
                        RequestDate: { $gte: lastHour },
                        ClientID: clientID,
                        Status: "Processing"
                    }
                }
            ]).toArray();
        }

        return res.length;
    } catch (err) {
        console.log("While getting pending count: ");
        console.error(err);
        writeLog("While getting pending count: " + err.toString());
        // Default return 1e9
        return 1000000000;
    }
}

const appendClient = async (clientID) => {
    try {
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").insertOne({
            ClientID: clientID,
            IsActivated: true,
            IsPremium: false,
            CreatedDate: new Date(),
            PremiumExpireDate: null,
            LastRequestDate: null,
            LastReportDate: null,
            RequestCount: 0,
            ReportCount: 0
        });
    } catch (err) {
        console.log("While appending client: " + clientID);
        console.error(err);
        writeLog("While appending client " + clientID + ": " + err.toString());
    }
}

const appendRequest = async (clientID, url, isBasic, n, l, offset, from, to, category) => {
    try {
        url = 'https://www.twitch.tv/videos/' + getVideoCode(url);

        if (isBasic === undefined) isBasic = constants.const_isBasic;
        if (n === undefined) n = constants.const_n;
        if (l === undefined) l = constants.const_l;
        if (offset === undefined) offset = constants.const_offset;
        if (from === undefined) from = constants.const_from;
        if (to === undefined) to = constants.const_to;
        if (category === undefined) category = constants.const_category;

        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("RequestLog").insertOne({
            ClientID: clientID,
            VideoURL: url,
            RequestDate: new Date(),
            Status: "Processing",
            Count: n,
            Length: l,
            Offset: offset,
            IsBasic: isBasic,
            From: from,
            To: to,
            Category: category
        });
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $inc: { RequestCount: 1 },
            $currentDate: { LastRequestDate: true }
        });
    } catch (err) {
        console.log("While appending request: ");
        console.error(err);
        writeLog("While appending request: " + err.toString());
    }
}

const updateRequest = async (id) => {
    try {
        let url = 'https://www.twitch.tv/videos/' + id;

        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("RequestLog").updateMany({
            VideoURL: url,
            Status: "Processing"
        }, {
            $set: { Status: "Done" }
        });
    } catch (err) {
        console.log("While updating request: ");
        console.error(err);
        writeLog("While updating request: " + err.toString());
    }
}

const appendReport = async (clientID, videoURL, email, message) => {
    try {
        url = 'https://www.twitch.tv/videos/' + getVideoCode(videoURL);

        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("ReportLog").insertOne({
            ClientID: clientID,
            VideoURL: url,
            Email: email,
            Message: message,
            ReportDate: new Date()
        });
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $inc: { ReportCount: 1 },
            $currentDate: { LastReportDate: true }
        });
    } catch (err) {
        console.log("While appending report: ");
        console.error(err);
        writeLog("While appending report: " + err.toString());
    }
}

const updateStatus = async (clientID, license) => {
    //console.log(license);
    try {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Writing to MongoDB
        let db = await getMongoDB();
        // console.log("Datebase: ");
        // console.log(db);
        db.collection("StatusLog").insertOne({
            ClientID: clientID,
            Kind: license.kind,
            SKU: license.sku,
            ItemID: license.itemId,
            Type: license.type,
            State: license.state,
            CheckDate: new Date()
        });

        upgradeAccount(clientID, tomorrow);
    } catch (err) {
        console.log("While updating status: ");
        console.error(err);
        writeLog("While updating status: " + err.toString());
    }
}

const appendPurchase = async (clientID, jwt, cartID, orderID) => {
    try {
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("PurchaseLog").insertOne({
            ClientID: clientID,
            JWT: jwt,
            CartID: cartID,
            OrderID: orderID,
            PurchaseDate: new Date()
        });
    } catch (err) {
        console.log("While appending purchase: ");
        console.error(err);
        writeLog("While appending purchase: " + err.toString());
    }
}

const updateIPAddress = async () => {
    let options = {
        host: 'ipv4bot.whatismyipaddress.com',
        port: 80,
        path: '/'
    };

    http.get(options, async (res) => {
        //console.log("status: " + res.statusCode);

        res.on("data", async (chunk) => {
            console.log("Server is being hosted on: " + chunk);
            writeLog("Server is being hosted on: " + chunk);

            try {
                // Writing to MongoDB
                let db = await getMongoDB();
                db.collection("IPAddress").updateOne({
                    key: "Aloha"
                }, {
                    $set: { ip: chunk.toString() },
                    $currentDate: { lastUpdateDate: true }
                });
            } catch (err) {
                console.log("While updating ipaddress: ");
                console.error(err);
                writeLog("While updating ipaddress: " + err.toString());
            }
        });
    }).on('error', async (e) => {
        console.log("While getting the ip address, error: " + e.message + ", retrying...");
        writeLog("While getting the ip address, error: " + e.message + ", retrying...");
        setTimeout(updateIPAddress, 1 * 60 * 1000);
    });
}

const transferClientsMssqlMongoDB = async () => {
    // config for database
    const pool = new sql.ConnectionPool({
        database: 'TwitchHighlightsDatabase',
        server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        driver: 'msnodesqlv8',
        options: {
            trustedConnection: true
        }
    });

    await pool.connect();

    // create query string
    let query = "SELECT * FROM Client";

    // query to the database and get the records
    result = await pool.request().query(query);

    if (result.recordset[0].IsPremium) {
        let expireDate = result.recordset[0].PremiumExpireDate;
        checkExpiredAccount(clientID, expireDate);
    }
    // connect to mongoDB
    let db = await getMongoDB();

    for (let i = 0; i < result.recordset.length; i++) {
        db.collection("Client").insertOne({
            ClientID: result.recordset[i].ClientID,
            IsActivated: result.recordset[i].IsActivated,
            IsPremium: result.recordset[i].IsPremium,
            CreatedDate: result.recordset[i].CreatedDate,
            PremiumExpireDate: result.recordset[i].PremiumExpireDate,
            LastRequestDate: result.recordset[i].LastRequestDate,
            LastReportDate: result.recordset[i].LastReportDate,
            RequestCount: result.recordset[i].RequestCount,
            ReportCount: result.recordset[i].ReportCount
        });
    }
}

//transferClientsMssqlMongoDB();

module.exports = {
    activateAccount, deactivateAccount, upgradeAccount, downgradeAccount, checkExpiredAccount,
    isPremium, getPendingCount, appendClient, appendRequest, updateRequest, appendReport,
    updateStatus, appendPurchase, updateIPAddress
}