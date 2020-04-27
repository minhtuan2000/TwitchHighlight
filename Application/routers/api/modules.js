//const freemem = require('os').freemem;
const fs = require('fs');
//const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const axios = require('axios');

const writeLog = require('./miscellaneous').writeLog;
const updateRequest = require('./database').updateRequest;
const constants = require('./constants');

const twitch_client_id = "j3vtenqy8mg878bzbkg7txbrj61p52";
const twitch_client_secret = "5i8u17i00lmm85rl7bgjjvmao2mf31";
let OAthAccessToken = "";

const getOAthAccessToken = async () => {
    try {
        let response = await axios.post(
            `https://id.twitch.tv/oauth2/token?` +
            `client_id=${twitch_client_id}&` +
            `client_secret=${twitch_client_secret}&` +
            `grant_type=client_credentials`);
        fs.writeFileSync("assets/OAth.token", response.data.access_token);
        return response.data.access_token;
    } catch (err) {
        console.log("While running getOAthAccessToken(): ");
        console.log(err);
        writeLog("While running getOAthAccessToken(): " + err.toString());
        return "";
    }
}

const getGame = async (id) => {
    // Get OAth access token
    if (OAthAccessToken === "") {
        try {
            // Read from file
            OAthAccessToken = fs.readFileSync("assets/OAth.token");
        } catch (err) {
            try {
                // Get new access token
                OAthAccessToken = await getOAthAccessToken();
            } catch (err) {
                console.log("While running getGame(): Can't get OAth access token");
                writeLog("While running getGame(): Can't get OAth access token");
                return;
            }
        }
    }

    //get game category name

    let tolerant = 5;
    try {    
        while (tolerant > 0){
            let headers = {
                "Accept": "application/vnd.twitchtv.v5+json",
                "Authorization": OAthAccessToken,
                "Client-ID": twitch_client_id
            };
    
            try {
                let response = await axios.get(
                    `https://api.twitch.tv/v5/videos/${id}`,
                    { headers: headers }
                );

                return response.data.game;
            } catch (err) {
                console.log("While running getGame(): " + err.response.status.toString() + " " + err.response.data.error + " " + err.response.data.message);
                writeLog("While running getGame(): " + err.response.status.toString() + " " + err.response.data.error + " " + err.response.data.message);
    
                tolerant--;
    
                // Try to get new access token if receive 401 error
                if (err.response.status === 401) {
                    try {
                        OAthAccessToken = await getOAthAccessToken();
                    } catch (err) {
                        console.log("While running getGame(): Can't get OAth access token");
                        writeLog("While running getGame(): Can't get OAth access token");
                        break;
                    }
                }
            }  
        }
    } catch (err) {
        console.log("While running getGame(): ");
        console.log(err);
        writeLog("While running getGame(): " + err.toString());
    }
}

const getChat = async (id) => {
    // Get OAth access token
    if (OAthAccessToken === "") {
        try {
            // Read from file
            OAthAccessToken = fs.readFileSync("assets/OAth.token");
        } catch (err) {
            try {
                // Get new access token
                OAthAccessToken = await getOAthAccessToken();
            } catch (err) {
                console.log("While running getChat(): Can't get OAth access token");
                writeLog("While running getChat(): Can't get OAth access token");
                return;
            }
        }
    }

    //console.log("Using OAth access token: " + OAthAccessToken);
    // Get chat    
    fs.writeFileSync(`assets/data/${id}.done`, 'False');
    let _next = "";
    let tolerant = 5;
    try {
        while (_next !== undefined && tolerant > 0) {
            let headers = {
                "Accept": "application/vnd.twitchtv.v5+json",
                "Authorization": OAthAccessToken,
                "Client-ID": twitch_client_id
            };

            try {
                let response = await axios.get(
                    `https://api.twitch.tv/v5/videos/${id}/comments?` +
                    (_next === "" ? "content_offset_seconds=0" : `cursor=${_next}`),
                    { headers: headers }
                );
                _next = response.data._next;
                let output = "";
                for (let i = 0; i < response.data.comments.length; i++) {
                    let hour = Math.floor(response.data.comments[i].content_offset_seconds / 3600).toString();
                    while (hour.length < 2) hour = "0" + hour;
                    let minute = (Math.floor(response.data.comments[i].content_offset_seconds / 60) % 60).toString();
                    while (minute.length < 2) minute = "0" + minute;
                    let second = (Math.floor(response.data.comments[i].content_offset_seconds) % 60).toString();
                    while (second.length < 2) second = "0" + second;
                    output += `[${hour}:${minute}:${second}] ${response.data.comments[i].message.body}\n`;
                }
                if (fs.existsSync(`assets/data/${id}.txt`)) {
                    fs.appendFileSync(`assets/data/${id}.txt`, output);
                } else {
                    fs.writeFileSync(`assets/data/${id}.txt`, output);
                }
            } catch (err) {
                console.log("While running getChat(): " + err.response.status.toString() + " " + err.response.data.error + " " + err.response.data.message);
                writeLog("While running getChat(): " + err.response.status.toString() + " " + err.response.data.error + " " + err.response.data.message);

                tolerant--;

                // Try to get new access token if receive 401 error
                if (err.response.status === 401) {
                    try {
                        OAthAccessToken = await getOAthAccessToken();
                    } catch (err) {
                        console.log("While running getChat(): Can't get OAth access token");
                        writeLog("While running getChat(): Can't get OAth access token");
                        break;
                    }
                }
            }
        }
    } catch (err) {
        console.log("While running getChat(): ");
        console.log(err);
        writeLog("While running getChat(): " + err.toString());
    }

    fs.writeFileSync(`assets/data/${id}.done`, 'True');
    updateRequest(id);
}

//Run basicFinder algorithm
const basicFinder = async (id, number, length, offset) => {
    return new Promise((resolve, reject) => {
        try {
            exec(`python3.7 basic.py ${id}.txt ${id}basicresults.txt ${id}basicdurations.txt ${number} ${length} ${offset}`,
                {
                    cwd: __dirname + '/../../assets/data'
                },
                async function (err, stdout, stderr) {
                    if (err) {
                        console.log("While running basicFinder(): ");
                        console.error(err);
                        writeLog("While running basicFinder(): " + err.toString());
                    }
                    let highlights = await fs.readFileSync(`assets/data/${id}basicresults.txt`);
                    highlights = highlights.toString().replace(/(\r)/gm, "").split('\n').slice(0, -1);
                    let durations = await fs.readFileSync(`assets/data/${id}basicdurations.txt`);
                    durations = durations.toString().replace(/(\r)/gm, "").split('\n').slice(0, -1);
                    resolve([highlights, durations]);
                });
        } catch (err) {
            console.log("While running basicFinder(): ");
            console.error(err);
            writeLog("While running basicFinder(): " + err.toString());
        }
    })
}

//Run advancedFinder algorithm
const advancedFinder = async (id, number, length, offset, category) => {
    let categoryName = "";
    category = parseInt(category);
    if (category === -1){
        categoryName = await getGame(id);
        switch (categoryName) {
            case "League of Legends":
                category = 1;
                break;
            case "Dota 2":
                category = 2;
                break;
            case "Counter-Strike: Global Offensive":
                category = 3;
                break;
            default:
                category = 0;
        }
    }

    // console.log(category);
    // console.log(categoryName);
    // console.log(constants.const_category_algorithms[category]);

    return new Promise((resolve, reject) => {
        try {
            exec(`python3.7 ${constants.const_category_algorithms[category]} ${id}.txt ${id}advancedresults.txt ${id}advanceddurations.txt ${number} ${length} ${offset}`,
                {
                    cwd: __dirname + '/../../assets/data'
                },
                async function (err, stdout, stderr) {
                    if (err) {
                        console.log("While running advancedFinder(): ");
                        console.error(err);
                        writeLog("While running advancedFinder(): " + err.toString());
                    }
                    let highlights = await fs.readFileSync(`assets/data/${id}advancedresults.txt`);
                    highlights = highlights.toString().replace(/(\r)/gm, "").split('\n').slice(0, -1);
                    let durations = await fs.readFileSync(`assets/data/${id}advanceddurations.txt`);
                    durations = durations.toString().replace(/(\r)/gm, "").split('\n').slice(0, -1);
                    resolve([highlights, durations, categoryName]);
                });
        } catch (err) {
            console.log("While running advancedFinder(): ");
            console.error(err);
            writeLog("While running advancedFinder(): " + err.toString());
        }
    })
}

const cleanFiles = async () => {
    console.log("Initiating files cleanup...");
    writeLog("Initiating files cleanup...")
    // Remove files older than 1 week old
    // Remove *.txt files
    exec(`find . -name '*.txt' -type f -mtime +7 -exec rm -f {} \\;`,
        {
            maxBuffer: 1024 * 1024 * 64,
            cwd: __dirname + '/../../assets/data'
        },
        async function (err, stdout, stderr) {
            if (err) {
                console.log("While removing old *.txt files: ");
                console.error(err);
                writeLog("While removing old *.txt files: " + err.toString());
            } else {
                console.log("Successfully removed old *.txt files!");
                writeLog("Successfully removed old *.txt files!");
            }
        });
    // Remove *.done files
    exec(`find . -name '*.done' -type f -mtime +7 -exec rm -f {} \\;`,
        {
            maxBuffer: 1024 * 1024 * 64,
            cwd: __dirname + '/../../assets/data'
        },
        async function (err, stdout, stderr) {
            if (err) {
                console.log("While removing old *.done files: ");
                console.error(err);
                writeLog("While removing old *.done files: " + err.toString());
            } else {
                console.log("Successfully removed old *.done files!");
                writeLog("Successfully removed old *.done files!");
            }
        });
    // Remove files that were not finished
    // Loop through all files in the folder
    const dir = await fs.promises.opendir('assets/data');
    for await (const dirent of dir) {
        if (dirent.name.endsWith(".done")) {
            fs.readFile('assets/data/' + dirent.name,
                async function (err, data) {
                    if (err) {
                        console.log("While reading file " + dirent.name + ": ");
                        console.log(err);
                        writeLog("While reading file " + dirent.name + ": " + err.toString());
                    } else {
                        // If not done
                        if (data.includes("False")) {
                            // Remove all files
                            let id = dirent.name.split(".")[0];
                            let fileList = [`assets/data/${id}.done`,
                            `assets/data/${id}.txt`,
                            `assets/data/${id}basicresults.txt`,
                            `assets/data/${id}basicdurations.txt`,
                            `assets/data/${id}advancedresults.txt`,
                            `assets/data/${id}advanceddurations.txt`
                            ];
                            updateRequest(id);
                            console.log("Cleaning up " + id);
                            writeLog("Cleaning up " + id);
                            for (let file of fileList) {
                                fs.exists(file,
                                    function (exists) {
                                        if (exists) fs.unlink(file,
                                            function (err) {
                                                if (err) {
                                                    console.log("While removing file " + file + ": ");
                                                    console.log(err);
                                                    writeLog("While removing file " + file + ": " + err.toString());
                                                } else {
                                                    // Success
                                                }
                                            }
                                        );
                                    }
                                );
                            }
                        }
                    }
                });
        };
    }
}

module.exports = { getChat, basicFinder, advancedFinder, cleanFiles };

