const exec = require('child_process').exec;
const fs = require('fs');

const logStream = fs.createWriteStream("assets\\log\\" + new Date().toISOString().replace(/[T:.]/g, '-') + ".log", {flags:'a'});

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
            } else {
                fs.writeFileSync(`assets\\data\\${id}.done`,'True');
            }
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

// Write log
const writeLog = (message) => {
    try{
        logStream.write(new Date().toISOString() + ": " + message.toString() + "\n");
    }catch(err){
        console.log("While running writeLog(): ");
        console.error(err);
    }
}

module.exports = {getChat, highlightFinder, writeLog}