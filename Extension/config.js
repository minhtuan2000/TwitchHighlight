
'use strict';

chrome.tabs.getSelected(null, function(tab){
    //Initialize DOM elements
    const settingButton = document.getElementById("setting-icon")
    const textboxN = document.getElementsByName("n")[0];
    const textboxL = document.getElementsByName("l")[0];
    const textboxOffset = document.getElementsByName("offset")[0];

    //console.log(settingButton);
    settingButton.addEventListener("click", function(){
        let settingPage = document.getElementById("setting");
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
})
