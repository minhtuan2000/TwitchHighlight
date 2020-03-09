const express = require('express');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const router = express.Router();

const modules = require('./modules');
const miscellaneous = require('./miscellaneous');
const database = require('./database');

let finished = false;

async function getHighlights(url, isBasic, n, l, offset, from, to){
    let code = miscellaneous.getVideoCode(url);
    //Log
    console.log("Received request for analysing video: " + code);
    miscellaneous.writeLog("Received request for analysing video: " + code);
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
                miscellaneous.writeLog("RechatTool has stopped for " + code + "!");
            } else {
                //file is not finished
                finished = false;
                //Log
                console.log("RechatTool is still running for " + code + "!");
                miscellaneous.writeLog("RechatTool is still running for " + code + "!");
            }

            if (isBasic == 1) 
            {
                console.log("Running basic algorithm for video " + code);
                miscellaneous.writeLog("Running basic algorithm for video " + code);
                // Basic algorithm
                let highlights = await modules.basicFinder(code, n, l, offset);
                return highlights;
            } else {
                // Advance algorithm
                console.log("Running advance algorithm for video " + code);
                miscellaneous.writeLog("Running advance algorithm for video " + code);
                // to be continue
                
                let highlights = await modules.advancedFinder(code, from, to);
                return highlights;
            }

        } else {
            //file doesn't exist
            finished = false;
            //run rechattool
            modules.getChat(code);
            
            //Log
            console.log("File " + code + ".done does not exist!");
            console.log("Running RechatTool...");
            miscellaneous.writeLog("File " + code + ".done does not exist! " + "Running RechatTool...");
            
            return new Array();
        }
    } catch(err) {
        console.log("While running getHighlights(): ")
        console.error(err);
        miscellaneous.writeLog("While running getHighlights(): " + err.toString());
    }
}

router.post('/', async (req, res) => {
    let clientID = req.body.clientID;
    if (clientID == null){
        // Create new clientID
        clientID = uuidv4();

        //Send it to the database
        database.appendClient(clientID);
    }
    console.log("Client " + clientID + " made a request");
    miscellaneous.writeLog("Client " + clientID + " made a request");
    
    // Check if client is authorized or not
    let temp = await database.isPremium(clientID);
    let premium = temp[0], activated = temp[1];

    let pendingRequests = await database.getPendingCount(clientID, req.body.url);

    // Log:
    console.log("Client account is " + (activated ? "" : "not ") + "activated, "+ (premium ? "" : "not ") + "premium, has " + pendingRequests.toString() + " pending requests");
    miscellaneous.writeLog("Client account is " + (activated ? "" : "not ") + "activated, "+ (premium ? "" : "not ") + "premium, has " + pendingRequests.toString() + " pending requests");
    
    let message = "";

    if (activated && pendingRequests < 5 && (premium || (req.body.isBasic == 1 && pendingRequests < 2))){
        //append request to database if it does not alrealdy exist
        database.appendRequest(clientID, 
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

        if (finished) database.updateRequest(miscellaneous.getVideoCode(req.body.url));
        
        //console.log(highlights);
        res.status(200);
        res.send(JSON.stringify({clientID: clientID, results: highlights, done: finished, message: message, premium: premium, activated: activated, isBasic: req.body.isBasic}));
    } else {
        if (!activated){
            message = "Sorry, we don't recognize your request, please try again";
            console.log("Request Error: Not activated");
            miscellaneous.writeLog("Request Error: Not activated");
        } else  if ((!premium && pendingRequests >= 2) || (pendingRequests >= 5)){
            message = "We are still processing your recent requests, please wait a moment!";
            console.log("Request Error: Too many requests");
            miscellaneous.writeLog("Request Error: Too many requests");
        } else {
            message = "Unavailable at the moment";
            console.log("Request Error: Not premium");
            miscellaneous.writeLog("Request Error: Not premium");
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