'use strict';

function loadConfig(tab){
    //Initialize DOM elements
    const reportButton = document.getElementById("report-icon");
    const sendReportButton = document.getElementById("send-button");
    const settingButton = document.getElementById("setting-icon");
    const settingBasicButton = document.getElementById("choice-basic");
    const settingAdvanceButton = document.getElementById("choice-advance");
    const subscribeButton = document.getElementById("subscribe-button");
    const textboxN = document.getElementsByName("n")[0];
    const textboxL = document.getElementsByName("l")[0];
    // const tickboxAutomode = document.getElementsByName("automode")[0];
    // const textboxFrom = document.getElementsByName("from")[0];
    // const textboxTo = document.getElementsByName("to")[0];
    const textboxN2 = document.getElementsByName("n2")[0];

    //Set value for textboxes
    textboxN.value = n;
    textboxL.value = l;
    // if (automode == 1) textboxL.disabled = true; else textboxL.disabled = false;
    // tickboxAutomode.checked = (automode == 1);
    // textboxFrom.value = from;
    // textboxTo.value = to;
    textboxN2.value = n;

    //Check subscription

    //subscribe button
    subscribeButton.addEventListener("click", function(){
        try{
            buyProduct("premium");
        }catch(err){
            console.log("Can not initialize buy flow:");
            console.log(err);
        }
    });

    //console.log(reportButton);
    reportButton.addEventListener("click", function(){
        reportButtonClicked();
    });

    sendReportButton.addEventListener("click", function(){
        reportButtonClicked();

        changeMessage("Sent!", "green", "white");

        setTimeout(() => changeMessage(recentMessage[0], recentMessage[1], recentMessage[2]), 2000);
        
        // Send a post request here
        const email = document.getElementsByName("email")[0].value;
        const url = document.getElementsByName("url")[0].value;
        const message = document.getElementsByName("message")[0].value;
        sendReport(email, url, message);
    });

    //Setting basic or advance
    settingBasicButton.addEventListener("click", function(){
        settingBasicButtonClicked();
        process(tab);
    });

    settingAdvanceButton.addEventListener("click", function(){
        settingAdvanceButtonClicked();
        process(tab);
    });

    //console.log(settingButton);
    settingButton.addEventListener("click", function(){
        const settingPage = document.getElementById("setting");
        const footer = document.getElementById("footer");
        const message = document.getElementById("message");
        const subscribe = document.getElementById("subscribe-container");
        if (settingPage.style.display == "none"){
            // setting page
            settingPage.style.display = "block";
            textboxN.value = n;
            textboxL.value = l;
            // tickboxAutomode.checked = (automode == 1);

            // footer
            footer.style.display = "block";

            //message
            message.style.display = "block";

            //sub
            if (isBasic == 0) 
                subscribe.style.display = "block";
            else 
                subscribe.style.display = "none";
        } else {
            settingPage.style.display = "none";

            // footer
            footer.style.display = "none";

            //message
            message.style.display = "none";

            //sub
            subscribe.style.display = "none";
        }
    });

    textboxN.addEventListener("change", function(){
        n = textboxN.value;
        textboxN2.value = n;
        window.localStorage.setItem("n", n.toString());
        console.log(`n is changed to ${n}`);
        process(tab);
    });

    textboxL.addEventListener("change", function(){
        l = textboxL.value;
        window.localStorage.setItem("l", l);
        console.log(`l is changed to ${l}`);
        process(tab);
    });

    // tickboxAutomode.addEventListener("click", function(){
    //     automode = tickboxAutomode.checked ? 1: 0;
    //     window.localStorage.setItem("automode", automode.toString());
    //     if (automode == 1) textboxL.disabled = true; else textboxL.disabled = false;
    //     console.log(`automode is changed to ${automode}`);
    //     process(tab);
    // });

    // textboxFrom.addEventListener("change", function(){
    //     from = textboxFrom.value;
    //     window.localStorage.setItem("from", from.toString());        
    //     console.log(`from is changed to ${from}`);
    //     process(tab);
    // });

    // textboxTo.addEventListener("change", function(){
    //     to = textboxTo.value;
    //     window.localStorage.setItem("to", to.toString());        
    //     console.log(`to is changed to ${to}`);
    //     process(tab);
    // });

    textboxN2.addEventListener("change", function(){
        n = textboxN2.value;
        textboxN.value = n;
        window.localStorage.setItem("n", n.toString());
        console.log(`n is changed to ${n}`);
        process(tab);
    });

    //Check if advance algorithm is being used
    if (isBasic == 0){
        settingAdvanceButtonClicked();
    } else {
        settingBasicButtonClicked();
    }
}

function resetConfig(){
    window.localStorage.setItem("n", const_n.toString());
    window.localStorage.setItem("l", const_l.toString());
    window.localStorage.setItem("offset", const_offset.toString());
    window.localStorage.setItem("from", const_from.toString());
    window.localStorage.setItem("to", const_to.toString());
    window.localStorage.setItem("isBasic", const_isBasic.toString());
    // window.localStorage.setItem("automode", const_automode.toString());
    
    n = parseInt(window.localStorage.getItem("n"));
    l = parseInt(window.localStorage.getItem("l"));
    offset = parseInt(window.localStorage.getItem("offset"));
    from = parseInt(window.localStorage.getItem("from"));
    to = parseInt(window.localStorage.getItem("to"));
    isBasic = parseInt(window.localStorage.getItem("isBasic"));
    // automode = parseInt(window.localStorage.getItem("automode"));
    
    const textboxN = document.getElementsByName("n")[0];
    const textboxL = document.getElementsByName("l")[0];
    // const tickboxAutomode = document.getElementsByName("automode")[0];
    // const textboxFrom = document.getElementsByName("from")[0];
    // const textboxTo = document.getElementsByName("to")[0];
    const textboxN2 = document.getElementsByName("n2")[0];

    textboxN.value = n;
    textboxL.value = l;
    // if (automode == 1) textboxL.disabled = true; else textboxL.disabled = false;
    // tickboxAutomode.checked = (automode == 1);
    // textboxFrom.value = from;
    // textboxTo.value = to;
    textboxN2.value = n;

    settingBasicButtonClicked();
}

function settingAdvanceButtonClicked(){
    const settingBasicPage = document.getElementById("setting-basic");
    const settingAdvancePage = document.getElementById("setting-advance");
    const subscribe = document.getElementById("subscribe-container");
    settingBasicPage.style.display = "none";
    settingAdvancePage.style.display = "inline-block";
    subscribe.style.display = "block";
    isBasic = 0;
    window.localStorage.setItem("isBasic", "0");
    console.log("Changed to advance algorithm");
}

function settingBasicButtonClicked(){
    const settingBasicPage = document.getElementById("setting-basic");
    const settingAdvancePage = document.getElementById("setting-advance");
    const subscribe = document.getElementById("subscribe-container");
    settingBasicPage.style.display = "inline-block";
    settingAdvancePage.style.display = "none";
    subscribe.style.display = "none";
    isBasic = 1;
    window.localStorage.setItem("isBasic", "1");
    console.log("Changed to basic algorithm");
}

function reportButtonClicked(){
    const main = document.getElementById("main");
    const report = document.getElementById("report");
    if (main.style.display == "none"){
        main.style.display = "block";
        report.style.display = "none";
    } else {
        main.style.display = "none";
        report.style.display = "block";
    }
}

function config(tab){
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded',loadConfig);
    } else {
        loadConfig(tab);
    }
}

chrome.tabs.getSelected(null, config);
