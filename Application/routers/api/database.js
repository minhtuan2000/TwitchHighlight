const sql = require('mssql/msnodesqlv8');

const writeLog = require('./miscellaneous').writeLog;
const getVideoCode = require('./miscellaneous').getVideoCode;


const activateAccount = (clientID) => {
    try{
        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        pool.connect().then(() => {
            // create query string
            let query = "UPDATE Client SET IsActivated=1" +
                        " WHERE ClientID='" + clientID + "'";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While activating account:");
                    console.log(err);
                    writeLog("While activating account: " + err.toString());
                } else {
                    console.log("Activated client " + clientID);
                    writeLog("Activated client " + clientID);
                }   
            });
        });
    }catch(err){
        console.log("While activating account:");
        console.error(err);
        writeLog("While activating account: " + err.toString());
    }
}

const deactivateAccount = (clientID) => {
    try{
        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        pool.connect().then(() => {
            // create query string
            let query = "UPDATE Client SET IsActivated=0" +
                        " WHERE ClientID='" + clientID + "'";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While deactivating account:");
                    console.log(err);
                    writeLog("While deactivating account: " + err.toString());
                } else {
                    console.log("Deactivated client " + clientID);
                    writeLog("Deactivated client " + clientID);
                }      
            });
        });
    }catch(err){
        console.log("While deactivating account:");
        console.error(err);
        writeLog("While deactivating account: " + err.toString());
    }
}

const upgradeAccount = (clientID, expireDate) => {
    try{
        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        pool.connect().then(() => {
            // create query string
            let query = "UPDATE Client SET IsPremium=1, PremiumExpireDate='" +
                        expireDate.toISOString().slice(0, 19).replace('T', ' ') + "'" +
                        " WHERE ClientID='" + clientID + "'";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While upgrading account:");
                    console.log(err);
                    writeLog("While upgrading account: " + err.toString());
                } else {
                    console.log("Upgraded client " + clientID + ", expire on " + expireDate.toString());
                    writeLog("Upgraded client " + clientID + ", expire on " + expireDate.toString());
                }   
            });
        });
    }catch(err){
        console.log("While upgrading account:");
        console.error(err);
        writeLog("While upgrading account: " + err.toString());
    }
}

const downgradeAccount = (clientID) => {
    try{
        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        pool.connect().then(() => {
            // create query string
            let query = "UPDATE Client SET IsPremium=0, PremiumExpireDate=NULL" +
                        " WHERE ClientID='" + clientID + "'";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While downgrading account:");
                    console.log(err);
                    writeLog("While downgrading account: " + err.toString());
                } else {
                    console.log("Downgraded client " + clientID);
                    writeLog("Downgraded client " + clientID);
                }            
            });
        });
    }catch(err){
        console.log("While downgrading account:");
        console.error(err);
        writeLog("While downgrading account: " + err.toString());
    }
}

const checkExpiredAccount = (clientID, expireDate) => {
    // Check if an account has expired:
    if (expireDate == null || expireDate.getTime() < new Date().getTime()){
        // Expired
        console.log("Client " + clientID + " has expired");
        writeLog("Client " + clientID + " has expired");
        downgradeAccount(clientID);
    }
}


// Check premium
const isPremium = async (clientID) => {
    try{
        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        await pool.connect();

        // create query string
        let query = "SELECT CLientID, IsPremium, IsActivated, PremiumExpireDate FROM Client WHERE ClientID = '" + clientID + "'";
        
        // query to the database and get the records
        result = await pool.request().query(query);

        if (result.recordset[0].IsPremium){
            let expireDate = result.recordset[0].PremiumExpireDate;
            checkExpiredAccount(clientID, expireDate);
        }
        
        return [result.recordset[0].IsPremium, result.recordset[0].IsActivated];

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

        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });
        
        await pool.connect();

        // create query string
        let query = "SELECT ClientID, VideoURL, MAX(RequestedDate) AS 'MaxDate'" + 
                    " FROM RequestLog" + 
                    " WHERE RequestedDate >= DATEADD(hour, -1, GETDATE()) AND ClientID = '" + 
                    clientID + "' AND Status = 'Processing'" + 
                    (url != null ? " AND VideoURL<>'" + url + "'" : "") + 
                    " GROUP BY VideoURL, ClientID";
        
        // query to the database and get the records
        result = await pool.request().query(query);
        
        return result.recordset.length;
    }catch(err){
        console.log("While getting pending count: ");
        console.error(err);
        writeLog("While getting pending count: " + err.toString());
        // Default return 1e9
        return 1000000000;
    }
}

const appendClient = (clientID) => {
    try{
        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });
        
        pool.connect().then(() => {
            // create query string
            let query = "INSERT INTO CLient (CLientID, CreatedDate, LastRequestDate, IsPremium, RequestCount, ReportCount, IsActivated)"+
                        " VALUES ('" + 
                        clientID + "','" + 
                        new Date().toISOString().slice(0, 19).replace('T', ' ') + "','" + 
                        new Date().toISOString().slice(0, 19).replace('T', ' ') + "'," + 
                        "0,0,0,1)";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While making query to the database:");
                    console.log(err);
                    writeLog("While making query to the database: " + err.toString());
                }       
            });
        });
    }catch(err){
        console.log("While appending client: " + clientID);
        console.error(err);
        writeLog("While appending client " + clientID + ": " + err.toString());
    }
}

const appendRequest = (clientID, url, isBasic, n, l, offset, from, to) => {
    try{
        url = 'https://www.twitch.tv/videos/' + getVideoCode(url);

        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        // Insert to RequestLog
        pool.connect().then(() => {
            // create query string
            let query = "INSERT INTO RequestLog (CLientID, VideoURL, RequestedDate, Status, Count, Length, Offset, IsBasic, [From], [To])"+
                        " VALUES ('" + 
                        clientID + "','" + 
                        url + "','" +
                        new Date().toISOString().slice(0, 19).replace('T', ' ') + "','" + 
                        "Processing'," + 
                        n.toString() + "," + 
                        l.toString() + "," + 
                        offset.toString() + "," +
                        isBasic.toString() + "," + 
                        from.toString() + "," + 
                        to.toString() + ")";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While making query to the database:");
                    console.log(err);
                    writeLog("While making query to the database: " + err.toString());
                }       
            });
        });

        // config for database
        const pool2 = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        // Update client
        pool2.connect().then(() => {
            // create query string
            let query = "UPDATE Client SET LastRequestDate='" +
                        new Date().toISOString().slice(0, 19).replace('T', ' ') + "', " +
                        "RequestCount = RequestCount + 1 " +
                        "WHERE ClientID='" + clientID + "'";
            
            // query to the database and get the records
            pool2.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While making query to the database:");
                    console.log(err);
                    writeLog("While making query to the database: " + err.toString());
                }       
            });
        });
    }catch(err){
        console.log("While appending request: ");
        console.error(err);
        writeLog("While appending request: " + err.toString());
    }
}

const updateRequest = (id) => {
    try{
        let url = 'https://www.twitch.tv/videos/' + id;

        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        pool.connect().then(() => {
            // create query string
            let query = "UPDATE RequestLog SET Status='Done'" +
                        " WHERE VideoURL='" + url + 
                        "' AND Status='Processing'";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While making query to the database:");
                    console.log(err);
                    writeLog("While making query to the database: " + err.toString());
                }       
            });
        });
    }catch(err){
        console.log("While updating request: ");
        console.error(err);
        writeLog("While updating request: " + err.toString());
    }
}


const appendReport = (clientID, videoURL, email, message) => {
    try{
        url = 'https://www.twitch.tv/videos/' + getVideoCode(videoURL);

        // config for database
        const pool = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        // Insert to RequestLog
        pool.connect().then(() => {
            // create query string
            let query = "INSERT INTO ReportLog (CLientID, VideoURL, Email, Message, ReportDate)"+
                        " VALUES ('" + 
                        clientID + "','" + 
                        url + "','" +
                        email + "','" +
                        message + "','" + 
                        new Date().toISOString().slice(0, 19).replace('T', ' ') + "')";
            
            // query to the database and get the records
            pool.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While making query to the database:");
                    console.log(err);
                    writeLog("While making query to the database: " + err.toString());
                }
            });
        });

        // config for database
        const pool2 = new sql.ConnectionPool({
            database: 'TwitchHighlightsDatabase',
            server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        });

        // Update client
        pool2.connect().then(() => {
            // create query string
            let query = "UPDATE Client SET LastReportDate='" +
                        new Date().toISOString().slice(0, 19).replace('T', ' ') + "', " +
                        "ReportCount = ReportCount + 1 " +
                        "WHERE ClientID='" + clientID + "'";
            
            // query to the database and get the records
            pool2.request().query(query, function (err, recordset) {
                if (err) {
                    console.log("While making query to the database:");
                    console.log(err);
                    writeLog("While making query to the database: " + err.toString());
                }       
            });
        });
    }catch(err){
        console.log("While appending report: ");
        console.error(err);
        writeLog("While appending report: " + err.toString());
    }
}

module.exports = {activateAccount, deactivateAccount, upgradeAccount, downgradeAccount, checkExpiredAccount,
                 isPremium, getPendingCount, appendClient, appendRequest, updateRequest, appendReport}