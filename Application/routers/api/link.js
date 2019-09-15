const express = require('express');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const router = express.Router();

const getChat = require('./modules').getChat;
const basicFinder = require('./modules').basicFinder;
const advancedFinder = require('./modules').advancedFinder;

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
        if (fs.existsSync("assets/data/" + code + ".done")) {
            //file exists
            //check if file is finshed ("True" in .done file)
            if (fs.readFileSync("assets/data/" + code + ".done") != "False"){
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
                let highlights = await basicFinder(code, n, l, offset);
                return highlights;
            } else {
                // Advance algorithm
                console.log("Running advance algorithm for video " + code);
                writeLog("Running advance algorithm for video " + code);
                // to be continue
                
                let highlights = await advancedFinder(code, from, to);
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
    let temp = await isPremium(clientID);
    let premium = temp[0], activated = temp[1];

    let pendingRequests = await getPendingCount(clientID, req.body.url);

    // Log:
    console.log("Client account is " + (activated ? "" : "not ") + "activated, "+ (premium ? "" : "not ") + "premium, has " + pendingRequests.toString() + " pending requests");
    writeLog("Client account is " + (activated ? "" : "not ") + "activated, "+ (premium ? "" : "not ") + "premium, has " + pendingRequests.toString() + " pending requests");
    
    let message = "";

    if (activated && pendingRequests < 5 && (premium || (req.body.isBasic == 1 && pendingRequests < 2))){
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
        res.send(JSON.stringify({clientID: clientID, results: highlights, done: finished, message: message, premium: premium, activated: activated, isBasic: req.body.isBasic}));
    } else {
        if (!activated){
            message = "Sorry, we don't recognize your request, please try again";
            console.log("Request Error: Not activated");
            writeLog("Request Error: Not activated");
        } else  if ((!premium && pendingRequests >= 2) || (pendingRequests >= 5)){
            message = "We are still processing your recent requests, please wait a moment!";
            console.log("Request Error: Too many requests");
            writeLog("Request Error: Too many requests");
        } else {
            message = "Unavailable at the moment";
            console.log("Request Error: Not premium");
            writeLog("Request Error: Not premium");
        }
        res.status(200);
        res.send(JSON.stringify({clientID: clientID, results: null, done: finished, message: message, premium: premium, activated: activated, isBasic: req.body.isBasic}));
    }
});

router.get('/', (req, res) => {
    res.status(200);
    res.send("Online");
});

module.exports = router;