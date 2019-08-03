// 2019 - Minh Tuan Nguyen

'use strict';

// Set localStorage at the beginning
if (window.localStorage.getItem("n") == null || 
    window.localStorage.getItem("l") == null ||
    window.localStorage.getItem("offset") == null){
  window.localStorage.setItem("n", const_n.toString());
  window.localStorage.setItem("l", const_l.toString());
  window.localStorage.setItem("offset", const_offset.toString());
}

if (window.localStorage.getItem("from") == null ||
    window.localStorage.getItem("to") == null){
  window.localStorage.setItem("from", const_from.toString());
  window.localStorage.setItem("to", const_to.toString());
}

// Default is using basic algorithm
if (window.localStorage.getItem("isBasic") == null) window.localStorage.setItem("isBasic", const_isBasic.toString());

// Initialize variables
let n = parseInt(window.localStorage.getItem("n"));
let l = parseInt(window.localStorage.getItem("l"));
let offset = parseInt(window.localStorage.getItem("offset"));

let from = parseInt(window.localStorage.getItem("from"));
let to = parseInt(window.localStorage.getItem("to"));

let isBasic = parseInt(window.localStorage.getItem("isBasic"));

//Get client ID
let clientID = window.localStorage.getItem("watermelon");

let online = false;

let recentMessage = ["Open a Twitch video to analyze", "darkgray", "white"];

function changeMessage(message, color, backgroundColor){
  let backgroundElement = document.getElementById("message");
  let textElement = document.getElementById("message-text");
  backgroundElement.style.backgroundColor = backgroundColor
  backgroundElement.style.color = color;
  textElement.textContent = message;
}

function removeOldButtons(){
  let oldButtonList = document.getElementsByClassName("button");
  while (oldButtonList.length > 0) document.getElementById("highlight-container").removeChild(oldButtonList[0]);
}

function setButton(id, url, i, time){
  let newButton = document.createElement("button");
  newButton.classList.add("button");
  newButton.onclick = function(){
    chrome.tabs.update(id, {url: "https://www.twitch.tv/videos/" + getVideoCode(url) + "?t=" + time});
  };
  newButton.textContent = (i + 1).toString();
  document.getElementById("highlight-container").appendChild(newButton);
  //console.log("Add button to " + time);
}

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
  }
}

function getVideoCode(url){
  let res = url.substring(29);
  let i = 0;
  while (i < res.length && '0123456789'.indexOf(res[i]) !== -1) i += 1;
  return res.substring(0, i);
}

function process(tab){
  if (online){
    // If online, then analyse the video
    let tabId = tab.id;
    let tabUrl = tab.url;

    //console.log("Running on URL: " + tabUrl);

    // Check if the URL is legit
    if (tabUrl.startsWith("https://www.twitch.tv/videos/")){
      
      //Get video code
      let videoCode = getVideoCode(tabUrl);
      console.log("Trying to analyse video: " + videoCode);
    
      //Set loading message
      recentMessage = ["Loading, please wait for the best results...", "darkgray", "yellow"];
      changeMessage("Loading, please wait for the best results...", "darkgray", "yellow");

      sendRequest(tabId, tabUrl);

    } else {

      //Set none message
      recentMessage = ["Open a Twitch video to analyze", "darkgray", "white"];
      changeMessage("Open a Twitch video to analyze", "darkgray", "white");
    }
  } else {
    // Try again in 1 second
    setTimeout(() => process(tab), 1000);
  }
}

chrome.tabs.getSelected(null, process);
