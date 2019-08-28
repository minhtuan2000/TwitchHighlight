let autoplayID = 0;


function setAutoplayButton(id, url, highlights, durations){
    //DOM variables
    let autoplayContainer = document.getElementById("autoplay-container");
    let autoplayButton = document.getElementById("autoplay-button");
    
    autoplayContainer.style.display = "block";
    autoplayButton.onclick = function(){
        let autoplayWarning = document.getElementById("autoplay-warning");
        autoplayWarning.style.display = "block";
        autoplayID += 1;
        autoPlay(autoplayID, id, url, 0, highlights, durations);
        //Rewire all highlights buttons
        buttonList = document.getElementsByClassName("button");
        for (let i = 0; i < buttonList.length; i++){
            try{
                buttonList[i].onclick = function(){       
                    autoplayID += 1;
                    autoPlay(autoplayID, id, url, i, highlights, durations);
                }
            } catch (err){
                console.log(err);
            }
        }
    }
}

function autoPlay(apID, id, url, i, highlights, durations){
    //Check if autoPlay should continue
    if (apID != autoplayID) return;
    // Return after playing every highlights
    const autoplayButton = document.getElementById("autoplay-button");
    const quitButton = document.getElementById("quit-button");
    if (i >= highlights.length){
        let autoplayWarning = document.getElementById("autoplay-warning");
        autoplayWarning.style.display = "none";
        autoplayButton.textContent = "Autoplay";
        setAutoplayButton(id, url, highlights, durations);
        //Reset all highlights buttons
        buttonList = document.getElementsByClassName("button");
        for (let i = 0; i < buttonList.length; i++){
            try{
                buttonList[i].onclick = function(){    
                    buttonList[i].style.backgroundColor = "darkorange";
                    chrome.tabs.update(id, {url: "https://www.twitch.tv/videos/" + getVideoCode(url) + "?t=" + highlights[i]});   
                }
            } catch (err){
                console.log(err);
            }
        }
        //Reset quit button
        quitButton.style.display = "none";
    } else {
        chrome.tabs.update(id, {url: "https://www.twitch.tv/videos/" + getVideoCode(url) + "?t=" + highlights[i]});
        document.getElementById((i + 1).toString()).style.backgroundColor = "darkorange";

        autoplayButton.textContent = "Next";
        autoplayButton.onclick = function(){
            autoplayID += 1;
            autoPlay(autoplayID, id, url, i + 1, highlights, durations);
        }

        quitButton.style.display = "inline-block";
        quitButton.onclick = function(){
            autoplayID += 1;
            autoPlay(autoplayID, id, url, highlights.length, highlights, durations);
        }

        setTimeout(() => {autoPlay(apID, id, url, i + 1, highlights, durations)}, parseInt(durations[i]) * 1000);
    }
}