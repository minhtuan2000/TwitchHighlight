// 2019 - Minh Tuan Nguyen

'use strict';

// Set localStorage at the beginning
if (window.localStorage.getItem("n") == null || 
    window.localStorage.getItem("l") == null ||
    window.localStorage.getItem("offset") == null){
  window.localStorage.setItem("n", "15");
  window.localStorage.setItem("l", "2");
  window.localStorage.setItem("offset", "5");
}

// Initialize variables
let n = parseInt(window.localStorage.getItem("n"));
let l = parseInt(window.localStorage.getItem("l"));
let offset = parseInt(window.localStorage.getItem("offset"));

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

function getVideoCode(url){
  let res = url.substring(29);
  let i = 0;
  while (i < res.length && '0123456789'.indexOf(res[i]) !== -1) i += 1;
  return res.substring(0, i);
}

function sendRequest(tabId, tabUrl){
  //Send a POST request to the server to analyse the video
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://35.233.106.177/api/link", true);
  xhr.setRequestHeader('Content-type', 'application/json');
  //console.log(JSON.stringify({url: tabUrl}));
  xhr.send(JSON.stringify({url: tabUrl, n: n, l: l, offset: offset}));
  xhr.onreadystatechange = function() {
    //console.log(xhr.readyState);
    //console.log(xhr.status);
    if (xhr.readyState == 4 && xhr.status == 200) {
      // Parse response
      let response = JSON.parse(xhr.responseText)["results"];
      //console.log(xhr.responseText);

      // Remove old buttons
      removeOldButtons();

      // Add new buttons
      for (let i = 0; i < response.length; i++){
        setButton(tabId, tabUrl, i, response[i]);
      }
      
      //Send a request to get update every 7 seconds
      //alert("I am still running!");
      if (JSON.parse(xhr.responseText)["done"] == false){
        setTimeout(() => sendRequest(tabId, tabUrl), 7000);
      } else {
        recentMessage = ["Done!", "white", "forestgreen"];
        changeMessage("Done!", "white", "forestgreen");
      }
    }
  }
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
      recentMessage = ["Loading...", "darkgray", "yellow"];
      changeMessage("Loading...", "darkgray", "yellow");

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
