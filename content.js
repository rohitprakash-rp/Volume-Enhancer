const Volume_Key = "volume_key";
const Default_Volume_Percentage = 100;
let currentVolumePercentage;

// Gain Node controls the vol of media stream
let gainNode;

initializeCurrentVolumePercentage();
initializeRequestListeners();

console.log("volume: "+ currentVolumePercentage);

function initializeCurrentVolumePercentage()
{
    currentVolumePercentage = sessionStorage.getItem(Volume_Key);

    console.log("saved volume: "+ currentVolumePercentage);
    
// if null then set as default & store in local storage
    if (currentVolumePercentage == null) 
    {
         currentVolumePercentage = Default_Volume_Percentage;
         sessionStorage.setItem(Volume_Key, String(currentVolumePercentage));
    }

    currentVolumePercentage = Number(currentVolumePercentage);

    console.log("Updated volume: " + currentVolumePercentage);
}

// add listener to initialise gain node and adjust vol
function initializeRequestListeners()
{
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request.message);
        if (request.message === "adjust_volume") {
            adjustVolume();
        }
        if (request.message === "save_volume"){
            currentVolumePercentage = Number(request.value);
            sessionStorage.setItem(Volume_Key, currentVolumePercentage);
        }
        if (request.message === "get_volume"){
            sendResponse(currentVolumePercentage);
        }
        if (request.message === "reset_volume"){
            resetVolume();
            adjustVolume();
        }
        if (request.message === "restore_volume"){
            setTimeout(function()
            {
                gainNode = gainNode || firstTimeSetUp();

                if (gainNode) {
                    let volumeMultiplier = Number(sessionStorage.getItem(Volume_Key)) / 100;
                    if (0 <= volumeMultiplier && volumeMultiplier <= 5) 
                    {
                        gainNode.gain.value = volumeMultiplier;
                    }
                }
            }, 150)

        }
        if (request.message === "debug") {
            console.log(request.value);
        }
    }
    );
}

// adjust volm
function adjustVolume()
{
    gainNode = gainNode || firstTimeSetUp();

    if (gainNode) {
        console.log("Volume changed: " + currentVolumePercentage);

        let volumeMultiplier = currentVolumePercentage / 100;
        if (0 <= volumeMultiplier && volumeMultiplier <= 5) {
            gainNode.gain.value = volumeMultiplier;
        }
    }
}

//reset volm key of current tab's sessionStorage to default value

function resetVolume()
{
    sessionStorage.setItem(Volume_Key, String(Default_Volume_Percentage));
    currentVolumePercentage = Default_Volume_Percentage;
}

function firstTimeSetUp() {
    
    const mediaStream = document.querySelector("video");

    if (!mediaStream) {
        return null;
    }

    const gainNode = createGainNodeFromAudio(mediaStream);

    return gainNode;
}

function createGainNodeFromAudio(mediaStream) {
    
    const audioContext = new AudioContext();
    // Create a MediaElementAudioSourceNode and feed the media stream into it.
    const mediaElementAudioSourceNode = audioContext.createMediaElementSource(mediaStream);
    // Create a GainNode to adjust volume.
    const gainNode = audioContext.createGain();

    // Reset the default gain to 1 (Default is 1 and range is (-inf, inf)).
    gainNode.gain.value = 1;

    // Connect the MediaElementAudioSourceNode to the gainNode and the gainNode to the audio destination
    // (the final destination of the audio in the context, i.e. a physical speaker or headset etc.).
    mediaElementAudioSourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return gainNode;
}

