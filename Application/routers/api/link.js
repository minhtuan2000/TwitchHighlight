const express = require('express');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const sql = require('mssql/msnodesqlv8');
const router = express.Router();

const getChat = require('./modules').getChat;
const highlightFinder = require('./modules').highlightFinder;

const writeLog = require('./miscellaneous').writeLog;
const getVideoCode = require('./miscellaneous').getVideoCode;

const isPremium = require('./database').isPremium;
const updateRequest = require('./database').updateRequest;
const getPendingCount = require('./database').getPendingCount;
const appendClient = require('./database').appendClient;
const appendRequest = require('./database').appendRequest;

let finished = false;

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
                
                let highlights = await highlightFinder(code, 15, l, offset);
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
    let premium = await isPremium(clientID);

    let pendingRequests = await getPendingCount(clientID, null);
    
    let message = "";

    if ((premium && pendingRequests < 10) || (req.body.isBasic == 1 && req.body.n == 12 && pendingRequests < 2)){
        //append request to database if it does not alrealdy exist
        appendRequest(clientID, 
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
        if (premium && pendingRequests){
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