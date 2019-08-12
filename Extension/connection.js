'use strict';

function checkServer(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://35.233.106.177/api/link", true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        online = true;
        document.getElementById("footer").style.backgroundColor = "forestgreen";
        document.getElementById("footer").title = "Status: Connected!";
        changeMessage(recentMessage[0], recentMessage[1], recentMessage[2]);
      } else {
        online = false;
        document.getElementById("footer").style.backgroundColor = "red";
        document.getElementById("footer").title = "Status: Disconnected!";
        changeMessage("Connection lost! Retrying...", "red", "white");
      }
    }
    setTimeout(() => checkServer(), 5000);
  }

checkServer();

function getLicenses() {
  google.payments.inapp.getPurchases({
    'parameters': {env: "prod"},
    'success': onLicenseUpdate,
    'failure': onLicenseUpdateFailed
  });
}

function onLicenseUpdate(response) {
  let licenses = response.response.details;
  let count = licenses.length;
  for (var i = 0; i < count; i++) {
    let license = licenses[i];
    if (license.state == "ACTIVE"){
      setTimeout(() => {document.getElementById("subscribe-container").style.display = "none";}, 100);
      sendUpdatedStatus(license);
    }
  }
}

function onLicenseUpdateFailed(response) {
}
function buyProduct(sku) {
  ga('send', 'event', "Purchase", "Initiate");
  google.payments.inapp.buy({
    parameters: {'env': "prod"},
    'sku': sku,
    'success': onPurchase,
    'failure': onPurchaseFailed
  });
}

function onPurchase(purchase) {
  let jwt = purchase.jwt;
  let cartId = purchase.request.cardId;
  let orderId = purchase.response.orderId;
  ga('send', 'event', "Purchase", "Succeed");
  sendPurchaseID(jwt, cartId, orderId);
  getLicences();
}

function onPurchaseFailed(purchase) {
  let reason = purchase.response.errorType;
  ga('send', 'event', "Purchase", "Fail", reason);
}

getLicenses();