const express = require('express');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const sql = require('mssql/msnodesqlv8');
const router = express.Router();
const getChat = require('./modules').getChat;
const highlightFinder = require('./modules').highlightFinder;
const writeLog = require('./modules').writeLog;
const isPremium = require('./modules').isPremium;
const updateRequest = require('./modules').updateRequest;

let finished = false;

function getPendingCount(clientID, url){
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
        
        pool.connect().then(() => {
            // create query string
            let query = "SELECT ClientID FROM RequestLog "+
                        "WHERE ClientID='" + clientID +
                        "' AND Status='Processing'" + (url != null ? " AND VideoURL='" + url + "'" : "");
            
            // query to the database and get the records
            pool.request().query(query, function (err, count) {
                if (err) {
                    console.log("While making query to the database:");
                    console.log(err);
                    writeLog("While making query to the database: " + err.toString());
                }
                // Need to fix     
                console.log(count);  
            });
        });
        return 0;
    }catch(err){
        console.log("While getting pending count: ");
        console.error(err);
        writeLog("While getting pending count: " + err.toString());
        return 5;
    }
}

function appendClient(clientID){
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

function appendRequest(clientID, url, isBasic, n, l, offset, from, to){
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
                        new Date().toISOString().slice(0, 19).replace('T', ' ') + "'" + 
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

function getVideoCode(url){
    let res = url.substring(29);
    let i = 0;
    while (i < res.length && '0123456789'.indexOf(res[i]) !== -1) i += 1;
    return res.substring(0, i);
}

async function getHighlights(url, isBasic, n, l, offset, from, to){
    let code = getVideoCode(url);
    //Log
    console.log("Received request for analysing video: " + code);
    writeLog("Received request for analysing video: " + code);
    // Check if result already exists or running
    try {
        if (fs.existsSync("assets\\data\\" + code + ".done")) {
            //file exists
            //check if file is finshed ("True" in .done file)
            if (fs.readFileSync("assets\\data\\" + code + ".done") != "False"){
                // file is finished
                finished = true;
                //Log
                console.log("RechatTool has stopped for " + code + "!");
                writeLog("RechatTool has stopped for " + code + "!");
            } else {
                //file is not finished
                finished = false;
                //Log
                console.log("RechatTool is still running for " + code + "!");
                writeLog("RechatTool is still running for " + code + "!");
            }

            if (isBasic == 1) 
            {
                console.log("Running basic algorithm for video " + code);
                writeLog("Running basic algorithm for video " + code);
                // Basic algorithm
                let highlights = await highlightFinder(code, n, l, offset);
                return highlights;
            } else {
                // Advance algorithm
                console.log("Running advance algorithm for video " + code);
                writeLog("Running advance algorithm for video " + code);
                // to be continue
                
                let highlights = await highlightFinder(code, from, l, offset);
                return highlights;
            }

        } else {
            //file doesn't exist
            finished = false;
            //run rechattool
            getChat(code);
            
            //Log
            console.log("File " + code + ".done does not exist!");
            console.log("Running RechatTool...");
            writeLog("File " + code + ".done does not exist! " + "Running RechatTool...");
            
            return new Array();
        }
    } catch(err) {
        console.log("While running getHighlights(): ")
        console.error(err);
        writeLog("While running getHighlights(): " + err.toString());
    }
}

router.post('/', async (req, res) => {
    let clientID = req.body.clientID;
    if (clientID == null){
        // Create new clientID
        clientID = uuidv4();

        //Send it to the database
        appendClient(clientID);
    }
    console.log("Client " + clientID + " made a request");
    writeLog("Client " + clientID + " made a request");
    
    // Check if client is authorized or not
    let premium = isPremium(clientID);

    let pendingRequests = getPendingCount(clientID, null);
    
    let message = "";

    if ((premium && pendingRequests < 5) || (req.body.isBasic == 1 && req.body.n == 12 && pendingRequests == 0)){
        //append request to database if it does not alrealdy exist
        if (true) appendRequest(clientID, 
                                req.body.url, 
                                req.body.isBasic, 
                                req.body.n, 
                                req.body.l, 
                                req.body.offset, 
                                req.body.from, 
                                req.body.to);
        
        let highlights = await getHighlights(req.body.url, 
                                            req.body.isBasic, 
                                            req.body.n, 
                                            req.body.l, 
                                            req.body.offset, 
                                            req.body.from, 
                                            req.body.to);
        message = "OK";

        if (finished) updateRequest(getVideoCode(req.body.url));
        
        //console.log(highlights);
        res.status(200);
        res.send(JSON.stringify({clientID: clientID, results: highlights, done: finished, message: message, premium: premium}));
    } else {
        if (isPremium(clientID) && getPendingCount(clientID) >= 5){
            message = "You can't analyze more than 5 videos at a time";
            console.log("Request Error: Premium, pending > 5");
            writeLog("Request Error: Premium, pending > 5");
        } else {
            message = "You have to subscribe to analyze more than 1 video at a time, use the advance algorithm or choose the number of highlights";
            console.log("Request Error: Not premium");
            writeLog("Request Error: Not premium");
        }
        res.status(200);
        res.send(JSON.stringify({clientID: clientID, results: null, done: finished, message: message, premium: premium}));
    }
});

router.get('/', (req, res) => {
    res.status(200);
    res.send("Online");
});

module.exports = router;