const exec = require('child_process').exec;
const fs = require('fs');

const writeLog = require('./miscellaneous').writeLog;

const updateRequest = require('./database').updateRequest;

//Run RechatTool
const getChat = (id)=>{
    fs.writeFileSync(`assets\\data\\${id}.done`,'False');
    console.log(__dirname);
    dir = exec(`RechatToolnew.exe -D ${id}`,  
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
            dir = exec(`highlight_finder.exe ${id}.txt ${id}results.txt ${number} ${length} ${offset}`, 
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

module.exports = {getChat, highlightFinder};

