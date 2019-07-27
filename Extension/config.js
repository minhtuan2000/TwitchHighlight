
'use strict';

function settingAdvanceButtonClicked(){
    const settingBasicPage = document.getElementById("setting-basic");
    const settingAdvancePage = document.getElementById("setting-advance");
    settingBasicPage.style.display = "none";
    settingAdvancePage.style.display = "inline-block";
    isBasic = 0;
    window.localStorage.setItem("isBasic", "0");
    console.log("Changed to advance algorithm");
}

function settingBasicButtonClicked(){
    const settingBasicPage = document.getElementById("setting-basic");
    const settingAdvancePage = document.getElementById("setting-advance");
    settingBasicPage.style.display = "inline-block";
    settingAdvancePage.style.display = "none";
    isBasic = 1;
    window.localStorage.setItem("isBasic", "1");
    console.log("Changed to basic algorithm");
}

function config(tab){
    if (document.getElementsByName("n").length == 0){
        console.log("Config: Waiting for page to load");
        setTimeout(() => config(tab), 100);
        return;
    }
    //Initialize DOM elements
    const settingButton = document.getElementById("setting-icon");
    const settingBasicButton = document.getElementById("choice-basic");
    const settingAdvanceButton = document.getElementById("choice-advance");
    const textboxN = document.getElementsByName("n")[0];
    const textboxL = document.getElementsByName("l")[0];
    const textboxOffset = document.getElementsByName("offset")[0];
    const textboxFrom = document.getElementsByName("from")[0];
    const textboxTo = document.getElementsByName("to")[0];

    //Set value for textboxes
    textboxN.value = n;
    textboxL.value = l;
    textboxOffset.value = offset;
    textboxFrom.value = from;
    textboxTo.value = to;

    //Setting basic or advance?
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
        if (settingPage.style.display == "none"){
            settingPage.style.display = "block";
            textboxN.value = n;
            textboxL.value = l;
            textboxOffset.value = offset;
        } else {
            settingPage.style.display = "none";
        }
    });

    textboxN.addEventListener("change", function(){
        n = textboxN.value;
        window.localStorage.setItem("n", n.toString());
        console.log(`n is changed to ${n}`);
        process(tab);
    });

    textboxL.addEventListener("change", function(){
        l = textboxL.value;
        window.localStorage.setItem("l", l.toString());
        console.log(`l is changed to ${l}`);
        process(tab);
    });

    textboxOffset.addEventListener("change", function(){
        offset = textboxOffset.value;
        window.localStorage.setItem("offset", offset.toString());        
        console.log(`offset is changed to ${offset}`);
        process(tab);
    });

    textboxFrom.addEventListener("change", function(){
        from = textboxFrom.value;
        window.localStorage.setItem("from", from.toString());        
        console.log(`from is changed to ${from}`);
        process(tab);
    });

    textboxTo.addEventListener("change", function(){
        to = textboxTo.value;
        window.localStorage.setItem("to", to.toString());        
        console.log(`to is changed to ${to}`);
        process(tab);
    });

    //Check if advance algorithm is being used
    if (isBasic == 0){
        settingAdvanceButtonClicked();
    } else {
        settingBasicButtonClicked();
    }
}

chrome.tabs.getSelected(null, config);
