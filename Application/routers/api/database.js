const writeLog = require('./miscellaneous').writeLog;
const getVideoCode = require('./miscellaneous').getVideoCode;

const MongoClient = require('mongodb').MongoClient;
let _db;

const connectMongoDB = async () => {
    if (_db){
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
    try{
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: {IsActivated: true}
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // pool.connect().then(() => {
        //     // create query string
        //     let query = "UPDATE Client SET IsActivated=1" +
        //                 " WHERE ClientID='" + clientID + "'";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While activating account:");
        //             console.log(err);
        //             writeLog("While activating account: " + err.toString());
        //         } else {
        //             console.log("Activated client " + clientID);
        //             writeLog("Activated client " + clientID);
        //         }   
        //     });
        // });
    }catch(err){
        console.log("While activating account:");
        console.error(err);
        writeLog("While activating account: " + err.toString());
    }
}

const deactivateAccount = async (clientID) => {
    try{
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: {IsActivated: false}
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // pool.connect().then(() => {
        //     // create query string
        //     let query = "UPDATE Client SET IsActivated=0" +
        //                 " WHERE ClientID='" + clientID + "'";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While deactivating account:");
        //             console.log(err);
        //             writeLog("While deactivating account: " + err.toString());
        //         } else {
        //             console.log("Deactivated client " + clientID);
        //             writeLog("Deactivated client " + clientID);
        //         }      
        //     });
        // });
    }catch(err){
        console.log("While deactivating account:");
        console.error(err);
        writeLog("While deactivating account: " + err.toString());
    }
}

const upgradeAccount = async (clientID, expireDate) => {
    try{
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: {IsPremium: true, PremiumExpireDate: expireDate}
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // pool.connect().then(() => {
        //     // create query string
        //     let query = "UPDATE Client SET IsPremium=1, PremiumExpireDate='" +
        //                 expireDate.toISOString().slice(0, 19).replace('T', ' ') + "'" +
        //                 " WHERE ClientID='" + clientID + "'";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While upgrading account:");
        //             console.log(err);
        //             writeLog("While upgrading account: " + err.toString());
        //         } else {
        //             console.log("Upgraded client " + clientID + ", expire on " + expireDate.toString());
        //             writeLog("Upgraded client " + clientID + ", expire on " + expireDate.toString());
        //         }   
        //     });
        // });
    }catch(err){
        console.log("While upgrading account:");
        console.error(err);
        writeLog("While upgrading account: " + err.toString());
    }
}

const downgradeAccount = async (clientID) => {
    try{
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $set: {IsPremium: false}
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // pool.connect().then(() => {
        //     // create query string
        //     let query = "UPDATE Client SET IsPremium=0, PremiumExpireDate=NULL" +
        //                 " WHERE ClientID='" + clientID + "'";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While downgrading account:");
        //             console.log(err);
        //             writeLog("While downgrading account: " + err.toString());
        //         } else {
        //             console.log("Downgraded client " + clientID);
        //             writeLog("Downgraded client " + clientID);
        //         }            
        //     });
        // });
    }catch(err){
        console.log("While downgrading account:");
        console.error(err);
        writeLog("While downgrading account: " + err.toString());
    }
}

const checkExpiredAccount = async (clientID, expireDate) => {
    // Check if an account has expired:
    if (expireDate == null || expireDate.getTime() < new Date().getTime()){
        // Expired
        console.log("Client " + clientID + " has expired");
        writeLog("Client " + clientID + " has expired");
        downgradeAccount(clientID);
    }
}

const isPremium = async (clientID) => {
    try{
        //Read from MongoDB
        let db = await getMongoDB();
        let res = await db.collection("Client").find({
            ClientID: clientID
        }).toArray();
        // console.log("Result isPremium:");
        // console.log(res[0].IsPremium);

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // await pool.connect();

        // // create query string
        // let query = "SELECT CLientID, IsPremium, IsActivated, PremiumExpireDate FROM Client WHERE ClientID = '" + clientID + "'";
        
        // // query to the database and get the records
        // result = await pool.request().query(query);

        // if (result.recordset[0].IsPremium){
        //     let expireDate = result.recordset[0].PremiumExpireDate;
        //     checkExpiredAccount(clientID, expireDate);
        // }
        
        return [res[0].IsPremium, res[0].IsActivated];

    }catch(err){
        console.log("While checking premium: ");
        console.error(err);
        writeLog("While checking premium: " + err.toString());
        // Default return false
        return [false, false];
    }
}

const getPendingCount = async (clientID, url) => {
    try{
        if (url != null) url = 'https://www.twitch.tv/videos/' + getVideoCode(url);
        
        // Reading from MongoDB
        let res = null;
        let lastHour = new Date();
        lastHour.setHours(lastHour.getHours() - 1);
        let db = await getMongoDB();
        if (url != null){
            res = await db.collection("RequestLog").aggregate([
                {$group: {
                    _id: {VideoURL: "$VideoURL", ClientID: "$ClientID"}, 
                    ClientID: {$last: "$ClientID"}, 
                    VideoURL: {$last: "$VideoURL"},
                    RequestDate: {$last: "$RequestDate"},
                    Status: {$last: "$Status"}
                }},
               {$match: {
                    RequestDate: { $gte : lastHour},
                    ClientID: clientID,
                    Status: "Processing",
                    VideoURL: {$ne: url}
               }} 
            ]).toArray();
        } else {
            res = await db.collection("RequestLog").aggregate([
                {$group: {
                    _id: {VideoURL: "$VideoURL", ClientID: "$ClientID"}, 
                    ClientID: {$last: "$ClientID"}, 
                    VideoURL: {$last: "$VideoURL"},
                    RequestDate: {$last: "$RequestDate"},
                    Status: {$last: "$Status"}
                }},
                {$match: {
                     RequestDate: { $gte : lastHour},
                     ClientID: clientID,
                     Status: "Processing"
                }} 
             ]).toArray();
        }

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });
        
        // await pool.connect();

        // // create query string
        // let query = "SELECT ClientID, VideoURL, MAX(RequestedDate) AS 'MaxDate'" + 
        //             " FROM RequestLog" + 
        //             " WHERE RequestedDate >= DATEADD(hour, -1, GETDATE()) AND ClientID = '" + 
        //             clientID + "' AND Status = 'Processing'" + 
        //             (url != null ? " AND VideoURL<>'" + url + "'" : "") + 
        //             " GROUP BY VideoURL, ClientID";
        
        // // query to the database and get the records
        // result = await pool.request().query(query);

        // console.log("GetPendingCount results: ");
        // console.log(res.length);
        // console.log(result.recordset.length);
        
        return res.length;
    }catch(err){
        console.log("While getting pending count: ");
        console.error(err);
        writeLog("While getting pending count: " + err.toString());
        // Default return 1e9
        return 1000000000;
    }
}

const appendClient = async (clientID) => {
    try{
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

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });
        
        // pool.connect().then(() => {
        //     // create query string
        //     let query = "INSERT INTO CLient (CLientID, CreatedDate, IsPremium, RequestCount, ReportCount, IsActivated)"+
        //                 " VALUES ('" + 
        //                 clientID + "','" + 
        //                 new Date().toISOString().slice(0, 19).replace('T', ' ') + "'," +
        //                 "0,0,0,0)";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }       
        //     });
        // });
    }catch(err){
        console.log("While appending client: " + clientID);
        console.error(err);
        writeLog("While appending client " + clientID + ": " + err.toString());
    }
}

const appendRequest = async (clientID, url, isBasic, n, l, offset, from, to) => {
    try{
        url = 'https://www.twitch.tv/videos/' + getVideoCode(url);

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
            To: to
        });
        db.collection("Client").updateOne({
            ClientID: clientID
        }, {
            $inc: {RequestCount: 1},
            $currentDate: {LastRequestDate: true}
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // // Insert to RequestLog
        // pool.connect().then(() => {
        //     // create query string
        //     let query = "INSERT INTO RequestLog (CLientID, VideoURL, RequestedDate, Status, Count, Length, Offset, IsBasic, [From], [To])"+
        //                 " VALUES ('" + 
        //                 clientID + "','" + 
        //                 url + "','" +
        //                 new Date().toISOString().slice(0, 19).replace('T', ' ') + "','" + 
        //                 "Processing'," + 
        //                 n.toString() + "," + 
        //                 l.toString() + "," + 
        //                 offset.toString() + "," +
        //                 isBasic.toString() + "," + 
        //                 from.toString() + "," + 
        //                 to.toString() + ")";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }       
        //     });
        // });

        // // config for database
        // const pool2 = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // // Update client
        // pool2.connect().then(() => {
        //     // create query string
        //     let query = "UPDATE Client SET LastRequestDate='" +
        //                 new Date().toISOString().slice(0, 19).replace('T', ' ') + "', " +
        //                 "RequestCount = RequestCount + 1 " +
        //                 "WHERE ClientID='" + clientID + "'";
            
        //     // query to the database and get the records
        //     pool2.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }       
        //     });
        // });
    }catch(err){
        console.log("While appending request: ");
        console.error(err);
        writeLog("While appending request: " + err.toString());
    }
}

const updateRequest = async (id) => {
    try{
        let url = 'https://www.twitch.tv/videos/' + id;

        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("RequestLog").updateMany({
            VideoURL: url,
            Status: "Processing"
        }, {
            $set: {Status: "Done"}
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // pool.connect().then(() => {
        //     // create query string
        //     let query = "UPDATE RequestLog SET Status='Done'" +
        //                 " WHERE VideoURL='" + url + 
        //                 "' AND Status='Processing'";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }       
        //     });
        // });
    }catch(err){
        console.log("While updating request: ");
        console.error(err);
        writeLog("While updating request: " + err.toString());
    }
}

const appendReport = async (clientID, videoURL, email, message) => {
    try{
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
            $inc: {ReportCount: 1},
            $currentDate: {LastReportDate: true}
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // // Insert to RequestLog
        // pool.connect().then(() => {
        //     // create query string
        //     let query = "INSERT INTO ReportLog (CLientID, VideoURL, Email, Message, ReportDate)"+
        //                 " VALUES ('" + 
        //                 clientID + "','" + 
        //                 url + "','" +
        //                 email + "','" +
        //                 message + "','" + 
        //                 new Date().toISOString().slice(0, 19).replace('T', ' ') + "')";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }
        //     });
        // });

        // // config for database
        // const pool2 = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // // Update client
        // pool2.connect().then(() => {
        //     // create query string
        //     let query = "UPDATE Client SET LastReportDate='" +
        //                 new Date().toISOString().slice(0, 19).replace('T', ' ') + "', " +
        //                 "ReportCount = ReportCount + 1 " +
        //                 "WHERE ClientID='" + clientID + "'";
            
        //     // query to the database and get the records
        //     pool2.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }       
        //     });
        // });
    }catch(err){
        console.log("While appending report: ");
        console.error(err);
        writeLog("While appending report: " + err.toString());
    }
}

const updateStatus = async (clientID, license) => {
    //console.log(license);
    try{
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

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // // Insert to RequestLog
        // pool.connect().then(() => {
        //     // create query string
        //     let query = "INSERT INTO StatusLog (CLientID, Kind, SKU, ItemID, Type, State, CheckDate)"+
        //                 " VALUES ('" + 
        //                 clientID + "','" + 
        //                 license.kind + "','" +
        //                 license.sku + "','" +
        //                 license.itemId + "','" + 
        //                 license.type + "','" +
        //                 license.state + "','" +
        //                 new Date().toISOString().slice(0, 19).replace('T', ' ') + "')";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }
        //     });
        // });

        upgradeAccount(clientID, tomorrow);
    }catch(err){
        console.log("While updating status: ");
        console.error(err);
        writeLog("While updating status: " + err.toString());
    }
}

const appendPurchase = async (clientID, jwt, cartID, orderID) => {
    try{
        // Writing to MongoDB
        let db = await getMongoDB();
        db.collection("PurchaseLog").insertOne({
            ClientID: clientID, 
            JWT: jwt, 
            CartID: cartID, 
            OrderID: orderID, 
            PurchaseDate: new Date()
        });

        // // config for database
        // const pool = new sql.ConnectionPool({
        //     database: 'TwitchHighlightsDatabase',
        //     server: 'SERVER-FOR-HIGH/SQLEXPRESS',
        //     driver: 'msnodesqlv8',
        //     options: {
        //         trustedConnection: true
        //     }
        // });

        // // Insert to RequestLog
        // pool.connect().then(() => {
        //     // create query string
        //     let query = "INSERT INTO PurchaseLog (CLientID, JWT, CartID, OrderID, PurchaseDate)"+
        //                 " VALUES ('" + 
        //                 clientID + "','" + 
        //                 jwt + "','" +
        //                 cartID + "','" +
        //                 orderID + "','" + 
        //                 new Date().toISOString().slice(0, 19).replace('T', ' ') + "')";
            
        //     // query to the database and get the records
        //     pool.request().query(query, function (err, recordset) {
        //         if (err) {
        //             console.log("While making query to the database:");
        //             console.log(err);
        //             writeLog("While making query to the database: " + err.toString());
        //         }
        //     });
        // });
    }catch(err){
        console.log("While appending purchase: ");
        console.error(err);
        writeLog("While appending purchase: " + err.toString());
    }
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

    if (result.recordset[0].IsPremium){
        let expireDate = result.recordset[0].PremiumExpireDate;
        checkExpiredAccount(clientID, expireDate);
    }
    // connect to mongoDB
    let db = await getMongoDB();

    for (let i = 0; i < result.recordset.length; i++){
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

module.exports = {activateAccount, deactivateAccount, upgradeAccount, downgradeAccount, checkExpiredAccount,
                 isPremium, getPendingCount, appendClient, appendRequest, updateRequest, appendReport,
                 updateStatus, appendPurchase}