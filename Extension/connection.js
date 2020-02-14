'use strict';

function checkServer(){
    //Send a POST request to the server to check the connection
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.now.sh/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify({type: "CheckConnection"}));
    xhr.onreadystatechange = function() {
      //console.log(xhr.readyState);
      //console.log(xhr.status);
      if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText === "OK") {
        // Server is available
        console.log("Server is online");
        online = true;
        document.getElementById("footer").style.backgroundColor = "forestgreen";
        document.getElementById("footer").title = "Status: Connected!";
        changeMessage(recentMessage[0], recentMessage[1], recentMessage[2]);
      } else {
        // Server is not available
        console.log("Sever is offline");
        online = false;
        document.getElementById("footer").style.backgroundColor = "red";
        document.getElementById("footer").title = "Status: Disconnected!";
        changeMessage("Connection lost! Retrying...", "red", "white");
      }
    }
    //Check connection every 5 seconds
    setTimeout(() => checkServer(), 5000);
  }

checkServer();