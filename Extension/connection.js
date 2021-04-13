'use strict';

function checkServer() {
    //Send a POST request to the server to check the connection
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://highlights.vercel.app/api", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify({ type: "CheckConnection" }));
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState, xhr.status, xhr.responseText);
        if (xhr.readyState !== 4 || (xhr.status === 200 && xhr.responseText === "OK")) {
            // Server is available
            console.log("Server is online");

            // Run when server is back online
            if (!online) chrome.tabs.query({ active: true }, process);

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

            //Check connection every 5 seconds if connection is lost
            setTimeout(() => checkServer(), 5000);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkServer);
} else {
    checkServer();
}

/*****************************************************************************
* Get the list of purchased products from the Chrome Web Store
*****************************************************************************/

function getLicenses() {
    console.log("google.payments.inapp.getPurchases");
    console.log("Retreiving list of purchased products...");
    google.payments.inapp.getPurchases({
        'parameters': { env: "prod" },
        'success': onLicenseUpdate,
        'failure': onLicenseUpdateFailed
    });
}

function onLicenseUpdate(response) {
    console.log("onLicenseUpdate", response);
    let licenses = response.response.details;
    let count = licenses.length;
    for (var i = 0; i < count; i++) {
        let license = licenses[i];
        if (license.state == "ACTIVE") {
            upgradeAccount();
            sendUpdatedStatus(license);
        }
    }
}

function onLicenseUpdateFailed(response) {
    console.log("onLicenseUpdateFailed", response);
    console.log("Error retreiving list of purchased products.");
}

function upgradeAccount(){
    console.log("Upgrading account...");
    isPremium = 1;
    const content = document.getElementById("content");
    content.style.display = "block";
    const unsubscribe = document.getElementById("unsubscribe-container");
    unsubscribe.style.display = "block";
    const subscribe = document.getElementById("subscribe-container");
    subscribe.style.display = "none";
}


/*****************************************************************************
* Purchase an item
*****************************************************************************/

function buyProduct(sku) {
    console.log("google.payments.inapp.buy", sku);
    console.log("Kicking off purchase flow for " + sku);
    ga('send', 'event', "Purchase", "Initiate");
    google.payments.inapp.buy({
        parameters: { 'env': "prod" },
        'sku': sku,
        'success': onPurchase,
        'failure': onPurchaseFailed
    });
}

function onPurchase(purchase) {
    console.log("onPurchase", purchase);
    let jwt = purchase.jwt;
    let cartId = purchase.request.cardId;
    let orderId = purchase.response.orderId;
    console.log("Purchase completed. Order ID: " + orderId);
    ga('send', 'event', "Purchase", "Succeed");
    sendPurchaseID(jwt, cartId, orderId);
    getLicences();
}

function onPurchaseFailed(purchase) {
    console.log("onPurchaseFailed", purchase);
    let reason = purchase.response.errorType;
    console.log("Purchase failed. " + reason);
    ga('send', 'event', "Purchase", "Fail", reason);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', getLicenses);
} else {
    getLicenses();
}