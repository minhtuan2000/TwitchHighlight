let autoplayID = 0;


function setAutoplayButton(id, url, highlights, isBasic, durations){
    //DOM variables
    let autoplayContainer = document.getElementById("autoplay-container");
    let autoplayButton = document.getElementById("autoplay-button");
    
    autoplayContainer.style.display = "block";
    autoplayButton.onclick = function(){
        let autoplayWarning = document.getElementById("autoplay-warning");
        autoplayWarning.style.display = "block";
        autoplayID += 1;
        autoPlay(autoplayID, id, url, 0, highlights, isBasic, durations);
        //Rewire all highlights buttons
        buttonList = document.getElementsByClassName("button");
        for (let i = 0; i < buttonList.length; i++){
            try{
                buttonList[i].onclick = function(){       
                    autoplayID += 1;
                    autoPlay(autoplayID, id, url, i, highlights, isBasic, durations);
                }
            } catch (err){
                console.log(err);
            }
        }
    }
}

function autoPlay(apID, id, url, i, highlights, isBasic, durations){
    //Check if autoPlay should continue
    if (apID != autoplayID) return;
    // Return after playing every highlights
    let autoplayButton = document.getElementById("autoplay-button");
    if (i >= highlights.length){
        let autoplayWarning = document.getElementById("autoplay-warning");
        autoplayWarning.style.display = "none";
        autoplayButton.textContent = "Autoplay";
        setAutoplayButton(id, url, highlights, isBasic, durations);
        //Reset all highlights buttons
        // Remove old buttons
        removeOldButtons();
        // Add new buttons
        for (let i = 0; i < highlights.length; i++){
          setButton(id, url, i, highlights[i]);
        }
    } else {
        chrome.tabs.update(id, {url: "https://www.twitch.tv/videos/" + getVideoCode(url) + "?t=" + highlights[i]});
        document.getElementById((i + 1).toString()).style.backgroundColor = "darkorange";

        autoplayButton.textContent = "Next";
        autoplayButton.onclick = function(){
            autoplayID += 1;
            autoPlay(autoplayID, id, url, i + 1, highlights, isBasic, durations);
        }
        if (isBasic){
            setTimeout(() => {autoPlay(apID, id, url, i + 1, highlights, isBasic, durations)}, l * 60 * 1000);
        } else {
            setTimeout(() => {autoPlay(apID, id, url, i + 1, highlights, isBasic, durations)}, parseInt(durations[i]) * 1000);
        }
    }
}