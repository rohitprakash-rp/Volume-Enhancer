const Default_Volume_Percentage = 100;

//popup.html initialise
initializeDom();
getVolumePercentage();

function initializeDom() {
// setup input fun 
    document.getElementById("volumeSlider").addEventListener("input",setOutputVolumePercentage);
    document.getElementById("confirmButton").addEventListener("click",SetConfirmButton);
    document.getElementById("resetButton").addEventListener("click",SetResetButton);
}

// slider value config
function setOutputVolumePercentage()
{
    document.getElementById("result").textContent = document.getElementById("volumeSlider").value + "%";
    document.getElementById("confirm msg").textContent = "";

}

// send confirmation of requested volume to content.js
function SetConfirmButton()
{
    document.getElementById("confirm msg").textContent = "Applied ⚡🌟⚡";
    saveNewVolume();
    applyNewVolume();
}

// send request for reset button to content.js
 function SetResetButton()
 {
    resetVolume();
 } 

 // to apply new volume 
 function applyNewVolume()
 {
    chrome.tabs.query( {active: true, currentWindow: true}, function (tabs)
    {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                message: "adjust_volume",
            });
    });
 }

 // to save new volume
 function saveNewVolume()
 {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs)
    {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                message: "save_volume",
                value: document.getElementById("volumeSlider").value
            });
    });
 }

 // reset volume to default
 function resetVolume()
 {
    chrome.tabs.query( {active: true, currentWindow: true}, function (tabs)
    {
        document.getElementById("volumeSlider").value = Default_Volume_Percentage;
        document.getElementById("result").textContent = Default_Volume_Percentage + "%";

        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                message: "reset_volume",
            });
    });
 }

 // to get the saved or applied volume

 function getVolumePercentage()
 {
    chrome.tabs.query({active: true,currentWindow: true},
        function (tabs)
        {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    message: "get_volume",
                },
                function (response)
                {
                    document.getElementById("volumeSlider").value = response;
                    document.getElementById("result").textContent = response+"%";
                    
                }
            );
        },
    );
 }
 