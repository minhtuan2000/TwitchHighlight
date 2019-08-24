const exec = require('child_process').exec;
const fs = require('fs');

const writeLog = require('./miscellaneous').writeLog;

const updateRequest = require('./database').updateRequest;

//Run RechatTool
const getChat = (id)=>{
    fs.writeFileSync(`assets\\data\\${id}.done`,'False');
    console.log(__dirname);
    dir = exec(`tcd -v ${id} --client-id 137oh7nvyaimf0yntfsjakm6wsvcvx`,  
        {
            cwd: __dirname + '\\..\\..\\assets\\data'
        },
        function(err, stdout, stderr) {
            if (err) {
                console.log("While running getchat(): ");
                console.log(err);
                writeLog("While running getChat(): " + err.toString());
            }
            // Even if error, it is still done, because this problem is unsolved.
            fs.writeFileSync(`assets\\data\\${id}.done`,'True');
            updateRequest(id);
            console.log(stdout);
        }
    );
    return; // non blocking
}

//Run highlightFinder algorithm
const highlightFinder =(id, number, length, offset) =>{
    return new Promise((resolve,reject)=>{
        try{
            dir = exec(`python basic.py ${id}.txt ${id}results.txt ${number} ${length} ${offset}`, 
            {
                cwd: __dirname + '\\..\\..\\assets\\data'
            },
            async function(err, stdout, stderr) {
                if (err) {
                    console.log("While running highlightFinder(): ");
                    console.error(err); 
                    writeLog("While running highlightFinder(): " + err.toString());
                }
                let file = await fs.readFileSync(`assets\\data\\${id}results.txt`);
                file = file.toString().replace(/(\r)/gm, "").split('\n').slice(0,-1);
                resolve(file);
            });
        }catch(err){
            console.log("While running highlightFinder(): ");
            console.error(err);
            writeLog("While running highlightFinder(): " + err.toString());
        }
    })
}

//Run advanceFinder algorithm
const advanceFinder =(id, from, to) =>{
    return new Promise((resolve,reject)=>{
        try{
            dir = exec(`python advance.py ${id}.txt ${id}advanceresults.txt ${id}durations.txt ${from} ${to}`, 
            {
                cwd: __dirname + '\\..\\..\\assets\\data'
            },
            async function(err, stdout, stderr) {
                if (err) {
                    console.log("While running advanceFinder(): ");
                    console.error(err); 
                    writeLog("While running advanceFinder(): " + err.toString());
                }
                let highlights = await fs.readFileSync(`assets\\data\\${id}advanceresults.txt`);
                highlights = highlights.toString().replace(/(\r)/gm, "").split('\n').slice(0,-1);
                let durations = await fs.readFileSync(`assets\\data\\${id}durations.txt`);
                durations = durations.toString().replace(/(\r)/gm, "").split('\n').slice(0,-1);
                resolve([highlights, durations]);
            });
        }catch(err){
            console.log("While running advanceFinder(): ");
            console.error(err);
            writeLog("While running advanceFinder(): " + err.toString());
        }
    })
}

module.exports = {getChat, highlightFinder, advanceFinder};

