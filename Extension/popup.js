// 2019 - Minh Tuan Nguyen

'use strict';

// Set localStorage at the beginning
if (window.localStorage.getItem("n") == null ||
    window.localStorage.getItem("l") == null ||
    window.localStorage.getItem("offset") == null) {
    window.localStorage.setItem("n", const_n.toString());
    window.localStorage.setItem("l", const_l);
    window.localStorage.setItem("offset", const_offset.toString());
}

if (window.localStorage.getItem("from") == null ||
    window.localStorage.getItem("to") == null) {
    window.localStorage.setItem("from", const_from.toString());
    window.localStorage.setItem("to", const_to.toString());
}

// Default is using basic algorithm
if (window.localStorage.getItem("isBasic") == null) window.localStorage.setItem("isBasic", const_isBasic.toString());

// // Default is automode
// if (window.localStorage.getItem("automode") == null) window.localStorage.setItem("automode", const_automode.toString());

// Default category is automatic
if (window.localStorage.getItem("category") == null) window.localStorage.setItem("category", const_category.toString());

// Initialize variables
let n = parseInt(window.localStorage.getItem("n"));
let l = window.localStorage.getItem("l");
let offset = parseInt(window.localStorage.getItem("offset"));

let from = parseInt(window.localStorage.getItem("from"));
let to = parseInt(window.localStorage.getItem("to"));

let isBasic = parseInt(window.localStorage.getItem("isBasic"));
// let automode = parseInt(window.localStorage.getItem("automode"));

let category = window.localStorage.getItem("category");

//Get client ID
let clientID = window.localStorage.getItem("watermelon");
let isPremium = 0;

let online = false;

let recentMessage = ["Open a Twitch video to analyze", "darkgray", "white"];
let hideMessageId;

function changeMessage(message, color, backgroundColor) {
    let backgroundElement = document.getElementById("message");
    let textElement = document.getElementById("message-text");
    backgroundElement.style.backgroundColor = backgroundColor
    backgroundElement.style.color = color;
    textElement.textContent = message;
    if (message === "Done!")
        hideMessageId = setTimeout(() => {
            backgroundElement.style.transitionDuration = "1s";
            backgroundElement.style.padding = "0px";
            backgroundElement.style.height = "0px";
        }, 5000);
    else {
        if (hideMessageId !== undefined && hideMessageId !== null) clearTimeout(hideMessageId);
        backgroundElement.style.transitionDuration = "0s";
        backgroundElement.style.padding = "2px 0px";
        backgroundElement.style.height = "25px";
    }
}

function removeOldButtons() {
    let oldButtonList = document.getElementsByClassName("button");
    while (oldButtonList.length > 0)
        document.getElementById("highlight-container").removeChild(oldButtonList[0]);
}

function setButton(id, url, i, time, done) {
    let newButton = document.createElement("button");
    newButton.classList.add("button");
    newButton.id = (i + 1).toString();
    newButton.onclick = function () {
        newButton.style.backgroundColor = "rgb(200, 200, 200)";
        chrome.tabs.update(id, { url: "https://www.twitch.tv/videos/" + getVideoCode(url) + "?t=" + time });
    };
    newButton.textContent = (i + 1).toString();
    setTimeout(() => document.getElementById("highlight-container").appendChild(newButton), done ? i * i * 5 + 500 : 0);
    //console.log("Add button to " + time);
}

function getVideoCode(url) {
    let res = url.substring(29);
    let i = 0;
    while (i < res.length && '0123456789'.indexOf(res[i]) !== -1) i += 1;
    return res.substring(0, i);
}

function cleanURL(url) {
    if (url.startsWith("https://www.twitch.tv/") && url.indexOf("/video/") != -1) {
        return "https://www.twitch.tv/videos/" + url.substring(url.indexOf("/video/") + 7);
    } else {
        return url;
    }
}

function process(tabs) {
    if (tabs.length == 0) return;
    let tab = tabs[0];
    if (online) {
        // If online, then analyze the video
        let tabId = tab.id;
        let tabUrl = cleanURL(tab.url);

        console.log("Running on URL: " + tabUrl);

        // Check if the URL is legit
        if (tabUrl.startsWith("https://www.twitch.tv/videos/")) {

            //Get video code
            let videoCode = getVideoCode(tabUrl);
            console.log("Trying to analyse video: " + videoCode);

            //Set loading message
            changeMessage("Loading, please wait for the best results...", "darkgray", "yellow");
            recentMessage = ["Loading, please wait for the best results...", "darkgray", "yellow"];

            sendRequest(tabId, tabUrl);

        } else {

            //Set none message
            changeMessage("Open a Twitch video to analyze", "darkgray", "white");
            recentMessage = ["Open a Twitch video to analyze", "darkgray", "white"];
        }
    }
}

chrome.tabs.query({ active: true, lastFocusedWindow: true }, process);
