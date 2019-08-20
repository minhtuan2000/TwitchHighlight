function sendRequest(tabId, tabUrl){
    ga('send', 'event', "Request", "Send", isBasic.toString());
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://35.233.106.177/api/link", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify({clientID: clientID, 
                              url: tabUrl, 
                              isBasic: isBasic, 
                              n: n, 
                              l: l, 
                              offset: offset, 
                              from: from,
                              to: to}));
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        clientID = JSON.parse(xhr.responseText)["clientID"];
        window.localStorage.setItem("watermelon", clientID);
  
        let responseMessage = JSON.parse(xhr.responseText)["message"];
        let responsePremium = JSON.parse(xhr.responseText)["premium"];
        let responseIsBasic = JSON.parse(xhr.responseText)["isBasic"];
        if (responseMessage == "OK"){
          if (responseIsBasic){
            let response = JSON.parse(xhr.responseText)["results"];
    
            removeOldButtons();
    
            for (let i = 0; i < response.length; i++){
              setButton(tabId, tabUrl, i, response[i]);
            }
    
            setAutoplayButton(tabId, tabUrl, response, responseIsBasic, null);
            
            if (JSON.parse(xhr.responseText)["done"] == false){
              setTimeout(() => sendRequest(tabId, tabUrl), 7000);
            } else {
              recentMessage = ["Done!", "white", "forestgreen"];
              changeMessage("Done!", "white", "forestgreen");
            }
          } else {
            let highlights = JSON.parse(xhr.responseText)["results"][0];
            let durations = JSON.parse(xhr.responseText)["results"][1];
            removeOldButtons();
            for (let i = 0; i < highlights.length; i++){
              setButton(tabId, tabUrl, i, highlights[i]);
            }
            setAutoplayButton(tabId, tabUrl, highlights, responseIsBasic, durations);
            if (JSON.parse(xhr.responseText)["done"] == false){
              setTimeout(() => sendRequest(tabId, tabUrl), 30000);
            } else {
              recentMessage = ["Done!", "white", "forestgreen"];
              changeMessage("Done!", "white", "forestgreen");
            }
          }
          
        } else {
          const highlightContainerError = document.getElementById("highlight-container-error");
          highlightContainerError.textContent = responseMessage;
          if (!responsePremium){
            resetConfig();
          }
        }
        
      }
    }
}

function sendReport(url, message){
    ga('send', 'event', "Report", "Send");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://35.233.106.177/api/report", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    
    xhr.send(JSON.stringify({clientID: clientID, 
                            url: url,
                            message: message}));
}

function sendPurchaseID(jwt, cartId, orderId){
  ga('send', 'event', "Purchase", "Send");
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://35.233.106.177/api/purchase", true);
  xhr.setRequestHeader('Content-type', 'application/json');
  
  xhr.send(JSON.stringify({clientID: clientID, 
                          jwt: jwt,
                          cartId: cartId,
                          orderId: orderId}));
}

function sendUpdatedStatus(license){
  ga('send', 'event', "Status", "Send");
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://35.233.106.177/api/status", true);
  xhr.setRequestHeader('Content-type', 'application/json');
  
  xhr.send(JSON.stringify({clientID: clientID, 
                          license: license}));
}

