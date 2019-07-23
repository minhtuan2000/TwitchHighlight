'use strict';

function checkServer(){
    //Send a GET request to the server
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://35.233.106.177/api/link", true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
      //console.log(xhr.readyState);
      //console.log(xhr.status);
      if (xhr.readyState == 4 && xhr.status == 200) {
        // Server is available
        console.log("Server is online");
        online = true;
        document.getElementById("footer").style.backgroundColor = "forestgreen";
        changeMessage(recentMessage[0], recentMessage[1], recentMessage[2]);
      } else {
        // Server is not available
        console.log("Sever is offline");
        online = false;
        document.getElementById("footer").style.backgroundColor = "red";
        changeMessage("Connection lost! Retrying...", "red", "white");
      }
    }
    //Check connection every 5 seconds
    setTimeout(() => checkServer(), 5000);
  }

  checkServer();