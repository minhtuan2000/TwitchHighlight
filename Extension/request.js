function sendRequest(tabId, tabUrl){
    //Log to analytics
    ga('send', 'event', "Request", "Send", isBasic.toString());
    //Send a POST request to the server to analyse the video
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.now.sh/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    //console.log(JSON.stringify({url: tabUrl}));
    xhr.send(JSON.stringify({type: "Request",
                              clientID: clientID, 
                              url: tabUrl, 
                              isBasic: isBasic, 
                              n: n, 
                              l: (automode == 0)? l: -1, 
                              offset: offset, 
                              from: from,
                              to: to}));
    xhr.onreadystatechange = function() {
      //console.log(xhr.readyState);
      //console.log(xhr.status);
      if (xhr.readyState == 4 && xhr.status == 200) {
        //console.log(xhr.responseText);
        //update clientID
        clientID = JSON.parse(xhr.responseText)["clientID"];
        window.localStorage.setItem("watermelon", clientID);
        //console.log("Your clientID is " + clientID);
  
        // Check response message
        let responseMessage = JSON.parse(xhr.responseText)["message"];
        let responsePremium = JSON.parse(xhr.responseText)["premium"];
        let responseIsBasic = JSON.parse(xhr.responseText)["isBasic"];
        if (responseMessage == "OK"){
          // Parse highlights
          let highlights = JSON.parse(xhr.responseText)["results"][0];
          // Parse durations
          let durations = JSON.parse(xhr.responseText)["results"][1];
          //console.log(durations);
          //console.log(xhr.responseText);
  
          // Remove old buttons
          removeOldButtons();
  
          // Add new buttons
          for (let i = 0; i < highlights.length; i++){
            setButton(tabId, tabUrl, i, highlights[i]);
          }
  
          //Rewire autoplay button
          setAutoplayButton(tabId, tabUrl, highlights, durations);

          if (responseIsBasic){
            //Send a request to get update every 7 seconds
            //alert("I am still running!");
            if (JSON.parse(xhr.responseText)["done"] == false){
              setTimeout(() => sendRequest(tabId, tabUrl), 7000);
            } else {
              recentMessage = ["Done!", "white", "forestgreen"];
              changeMessage("Done!", "white", "forestgreen");
            }
          } else {            
            //Send a request to get update every 30 seconds
            //alert("I am still running!");
            if (JSON.parse(xhr.responseText)["done"] == false){
              setTimeout(() => sendRequest(tabId, tabUrl), 30000);
            } else {
              recentMessage = ["Done!", "white", "forestgreen"];
              changeMessage("Done!", "white", "forestgreen");
            }
          }
          
        } else {
          // This part only check if client is authorized to use advance setting or request multiple times
          const highlightContainerError = document.getElementById("highlight-container-error");
          highlightContainerError.textContent = responseMessage;
          if (!responsePremium){
            // Reset config
            resetConfig();
          }
        }
        
      }
    }
}

function sendReport(email, url, message){
    ga('send', 'event', "Report", "Send");
    //Send a POST request with the report message
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.now.sh/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    
    xhr.send(JSON.stringify({type: "Report",
                            clientID: clientID, 
                            email: email,
                            url: url,
                            message: message}));
}
