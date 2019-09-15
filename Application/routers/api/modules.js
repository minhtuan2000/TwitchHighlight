const exec = require('child_process').exec;
const fs = require('fs');

const writeLog = require('./miscellaneous').writeLog;

const updateRequest = require('./database').updateRequest;

//Run RechatTool
const getChat = (id)=>{
    fs.writeFileSync(`assets/data/${id}.done`,'False');
    console.log(__dirname);
    dir = exec(`tcd -v ${id} --format timeonly --client-id 137oh7nvyaimf0yntfsjakm6wsvcvx`,  
        {
            maxBuffer: 1024 * 1024 * 64,
            cwd: __dirname + '/../../assets/data'
        },
        function(err, stdout, stderr) {
            if (err) {
                console.log("While running getchat(): ");
                console.log(err);
                writeLog("While running getChat(): " + err.toString());
            }
            // Even if error, it is still done, because this problem is unsolved.
            fs.writeFileSync(`assets/data/${id}.done`,'True');
            updateRequest(id);
            console.log(stdout);
        }
    );
    return; // non blocking
}

//Run basicFinder algorithm
const basicFinder =(id, number, length, offset) =>{
    return new Promise((resolve,reject)=>{
        try{
            dir = exec(`python3.7 basic.py ${id}.txt ${id}basicresults.txt ${id}basicdurations.txt ${number} ${length} ${offset}`, 
            {
                cwd: __dirname + '/../../assets/data'
            },
            async function(err, stdout, stderr) {
                if (err) {
                    console.log("While running basicFinder(): ");
                    console.error(err); 
                    writeLog("While running basicFinder(): " + err.toString());
                }
                let highlights = await fs.readFileSync(`assets/data/${id}basicresults.txt`);
                highlights = highlights.toString().replace(/(\r)/gm, "").split('\n').slice(0,-1);
                let durations = await fs.readFileSync(`assets/data/${id}basicdurations.txt`);
                durations = durations.toString().replace(/(\r)/gm, "").split('\n').slice(0,-1);
                resolve([highlights, durations]);
            });
        }catch(err){
            console.log("While running basicFinder(): ");
            console.error(err);
            writeLog("While running basicFinder(): " + err.toString());
        }
    })
}

//Run advancedFinder algorithm
const advancedFinder =(id, from, to) =>{
    return new Promise((resolve,reject)=>{
        try{
            dir = exec(`python3.7 advance.py ${id}.txt ${id}advancedresults.txt ${id}advanceddurations.txt ${from} ${to}`, 
            {
                cwd: __dirname + '/../../assets/data'
            },
            async function(err, stdout, stderr) {
                if (err) {
                    console.log("While running advancedFinder(): ");
                    console.error(err); 
                    writeLog("While running advancedFinder(): " + err.toString());
                }
                let highlights = await fs.readFileSync(`assets/data/${id}advancedresults.txt`);
                highlights = highlights.toString().replace(/(\r)/gm, "").split('\n').slice(0,-1);
                let durations = await fs.readFileSync(`assets/data/${id}advanceddurations.txt`);
                durations = durations.toString().replace(/(\r)/gm, "").split('\n').slice(0,-1);
                resolve([highlights, durations]);
            });
        }catch(err){
            console.log("While running advancedFinder(): ");
            console.error(err);
            writeLog("While running advancedFinder(): " + err.toString());
        }
    })
}

module.exports = {getChat, basicFinder, advancedFinder};

