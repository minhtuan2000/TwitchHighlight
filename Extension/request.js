function sendRequest(tabId, tabUrl) {
    //Log to analytics
    ga('send', 'event', "Request", "Send", isBasic.toString());
    //Send a POST request to the server to analyse the video
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.now.sh/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    //console.log(JSON.stringify({url: tabUrl}));
    xhr.send(JSON.stringify({
        type: "Request",
        clientID: clientID,
        url: tabUrl,
        isBasic: isBasic,
        n: n,
        l: (isBasic == 1) ? l : "-1",
        offset: offset,
        from: from,
        to: to,
        category: category
    }));
    xhr.onreadystatechange = function () {
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
            let responseDone = JSON.parse(xhr.responseText)["done"];
            if (responseMessage == "OK") {
                // Remove error message
                const highlightContainerError = document.getElementById("highlight-container-error");
                highlightContainerError.textContent = "";

                let advice = JSON.parse(xhr.responseText)["advice"];
                if (advice !== null && advice !== undefined && advice !== ""){
                    // Set advice
                    const highlightContainerAdvice = document.getElementById("highlight-container-advice");
                    highlightContainerAdvice.textContent = JSON.parse(xhr.responseText)["advice"];
                }

                let results = JSON.parse(xhr.responseText)["results"];
                // Parse highlights
                let highlights = results[0];
                // Parse durations
                let durations = results[1];
                //console.log(durations);
                //console.log(xhr.responseText);

                // Update category
                const autoChoice = document.getElementById("select-title-auto");
                if (results[2] !== null && results[2] !== undefined && results[2] !== ""){
                    autoChoice.textContent = "Detected: " + results[2];
                } else {
                    autoChoice.textContent = "Automatic";
                }

                // Remove old buttons
                removeOldButtons();

                // Add new buttons
                for (let i = 0; i < highlights.length; i++) {
                    setButton(tabId, tabUrl, i, highlights[i], responseDone);
                }

                //Rewire autoplay button
                setAutoplayButton(tabId, tabUrl, highlights, durations);

                if (responseIsBasic) {
                    //Send a request to get update every 7 seconds
                    //alert("I am still running!");
                    if (!responseDone) {
                        setTimeout(() => sendRequest(tabId, tabUrl), 7000);
                    } else {
                        changeMessage("Done!", "white", "forestgreen");
                        recentMessage = ["Done!", "white", "forestgreen"];
                    }
                } else {
                    //Send a request to get update every 7 seconds
                    //alert("I am still running!");
                    if (!responseDone) {
                        setTimeout(() => sendRequest(tabId, tabUrl), 7000);
                    } else {
                        changeMessage("Done!", "white", "forestgreen");
                        recentMessage = ["Done!", "white", "forestgreen"];
                    }
                }

            } else {
                // Check if client is authorized to use advance setting or request multiple times
                const highlightContainerError = document.getElementById("highlight-container-error");
                highlightContainerError.textContent = responseMessage;
                if (!responsePremium) {
                    const subscribe = document.getElementById("subscribe-container");
                    subscribe.style.display = "block";
                }

                // Remove old buttons
                removeOldButtons();

                // Reset autoplay buttons
                document.getElementById("autoplay-container").style.display = "none";
                document.getElementById("autoplay-warning").style.display = "none";
                document.getElementById("autoplay-button").textContent = "Play all highlights";
                document.getElementById("quit-button").style.display = "none";
            }

        }
    }
}

function sendReport(email, url, message) {
    ga('send', 'event', "Report", "Send");
    //Send a POST request with the report message
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.now.sh/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.send(JSON.stringify({
        type: "Report",
        clientID: clientID,
        email: email,
        url: url,
        message: message
    }));
}

function sendPurchaseID(jwt, cartId, orderId) {
    ga('send', 'event', "Purchase", "Send");
    //Send a POST request with the purchaseID
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.now.sh/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.send(JSON.stringify({
        type: "PurchaseID",
        clientID: clientID,
        jwt: jwt,
        cartId: cartId,
        orderId: orderId
    }));
}

function sendUpdatedStatus(license) {
    ga('send', 'event', "Status", "Send");
    //Send a POST request with the client status
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.now.sh/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.send(JSON.stringify({
        type: "UpdatedStatus",
        clientID: clientID,
        license: license
    }));
}

