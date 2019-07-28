const exec = require('child_process').exec;
const fs = require('fs');
const sql = require('mssql/msnodesqlv8');

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
                updateRequest(id);
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


// config for database
const pool = new sql.ConnectionPool({
    database: 'TwitchHighlightsDatabase',
    server: 'SERVER-FOR-HIGH\\SQLEXPRESS',
    driver: 'msnodesqlv8',
    options: {
      trustedConnection: true
    }
});

// Check premium
function isPremium(clientID){
    try{
        return false;
    }catch(err){
        console.log("While checking premium: ");
        console.error(err);
        writeLog("While checking premium: " + err.toString());
        return false;
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

module.exports = {getChat, highlightFinder, writeLog, isPremium, updateRequest};

