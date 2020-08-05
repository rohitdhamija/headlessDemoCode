'use strict';

// Set client auth mode - true to enable client auth, false to disable it
const isClientAuthEnabled = false;


/**
 * Initializes the SDK and sets a global field with passed name for it the can
 * be referred later
 *
 * @param {string} name Name by which the chat widget should be referred
 */
const initSdk = (name) => {
    if (!name) {
        name = 'Bots';          // Set default reference name to 'Bots'
    }
    let Bots;

    setTimeout(() => {
        /**
         * SDK configuration settings
         * Other than URI, all fields are optional with two exceptions for auth modes
         * In client auth disabled mode, 'channelId' must be passed, 'userId' is optional
         * In client auth enabled mode, 'clientAuthEnabled: true' must be passed
         */
        let chatWidgetSettings = {
            URI: 'pmdademo1-bots4saas.botmxp.ocp.oraclecloud.com',                               // ODA URI, only the hostname part should be passed, without the https://
            clientAuthEnabled: isClientAuthEnabled,     // Enables client auth enabled mode of connection if set true
            channelId: 'b15fa2db-2b25-40e0-aff4-25da8e925b63',                   // Channel ID, available in channel settings in ODA UI
            enableHeadless: true,
            enableAutocomplete: true,                   // Enables autocomplete suggestions on user input
            enableBotAudioResponse: true,               // Enables audio utterance of skill responses
            enableClearMessage: true,                   // Enables display of button to clear conversation
            enableSpeech: true,                         // Enables voice recognition
            enableTimestamp: false,                     // Show timestamp with each message
            speechLocale: WebSDK.SPEECH_LOCALE.EN_US,   // Sets locale used to speak to the skill, the SDK supports EN_US, FR_FR, and ES_ES locales for speech
            showConnectionStatus: true,                 // Displays current connection status on the header
            i18n: {                                     // Provide translations for the strings used in the widget
                en: {                                   // en locale, can be configured for any locale
                    chatTitle: 'MSTeams setup assistant'    // Set title at chat header
                }
            },
            theme: WebSDK.THEME.REDWOOD_DARK            // Redwood dark theme. The default is THEME.DEFAULT, while older theme is available as THEME.CLASSIC
        };

        // Initialize SDK
        if (isClientAuthEnabled) {
            Bots = new WebSDK(chatWidgetSettings, generateToken);
        } else {
            Bots = new WebSDK(chatWidgetSettings);
        }

        // Optional event listeners
        // All event listeners should preferably added before the connect() call, otherwise they may not be fired correctly
        Bots.on(WebSDK.EVENT.CLICK_AUDIO_RESPONSE_TOGGLE, (state) => {
            console.log('Response utterance toggled, current status =', state);
        });

        Bots.on(WebSDK.EVENT.WIDGET_OPENED, () => {
            console.log('Widget is opened');
        });

        Bots.on(WebSDK.EVENT.CLICK_ERASE, () => {
            console.log('Conversation history is erased.');
        });
        //       Bots.on(WebSDK.EVENT.CLICK_VOICE_TOGGLE, (status) => {
        Bots.on('click:voicetoggle', function (status) {
            if (status === true) {
                console.log('Voice recording is started.');
            } else {
                console.log('Voice recording is stopped.');
            }
        });

        Bots.on(WebSDK.EVENT.DESTROY, () => {
            console.log('destroy is called');
        });

        Bots.on(WebSDK.EVENT.MESSAGE, (message) => {
            console.log('a message was added to the conversation', message);
        });

        Bots.on(WebSDK.EVENT.MESSAGE_RECEIVED, (message) => {
            var msg = message.messagePayload.text;
            console.log('the user received a message', msg);
            updateMessageinList(msg);
        });

        Bots.on(WebSDK.EVENT.MESSAGE_SENT, (message) => {
            console.log('the user sent a message', message);
        });

        Bots.on(WebSDK.EVENT.NETWORK, (status) => {
            switch (status) {
                case 0:
                    status = 'Connecting';
                    break;
                case 1:
                    status = 'Open';
                    break;
                case 2:
                    status = 'Closing';
                    break;
                case 3:
                    status = 'Closed';
                    break;
            }

            console.log('Network status:' + status);
            networkStatusUpdate(status);
        });


        Bots.on(WebSDK.EVENT.READY, () => {
            console.log('the init has completed!');
            networkStatusUpdate("Connnected");
        });

        Bots.on(WebSDK.EVENT.UNREAD, (unreadCount) => {
            console.log('the number of unread messages was updated', unreadCount);
        });

        Bots.on(WebSDK.EVENT.WIDGET_CLOSED, () => {
            console.log('Widget is closed');
        });

        Bots.on(WebSDK.EVENT.CLICK_AUDIO_RESPONSE_TOGGLE, function (status) {
            if (status === true) {
                console.log('Audio response is turned on.');
            } else {
                console.log('Audio response is turned off.');
            }
        })



        // Connect to the ODA
        Bots.connect();

        // Create global object to refer Bots
        window[name] = Bots;
    }, 0);
};

function resetRecording() {
    Bots.stopVoiceRecording()
    $('#recButton').removeClass("Rec");
    $('#recButton').addClass("notRec");
}
function startRecording() {
    console.log("recording started..");
    Bots.startVoiceRecording((data) => {
        let recognizedText = '';
        if (data && (data.event === 'finalResult' || data.event === 'partialResult')) {
            if (data.nbest && data.nbest.length > 0) {

                recognizedText = data.nbest[0].utterance;
                console.log("recognized text: " + recognizedText);
                document.getElementById("myInput").value = recognizedText;
                if (data.event === 'finalResult') {

                    console.log(data.event);
                    resetRecording();

                    newElement();
                }
            }
        }
    }, (status, error) => {
        if (status === WebSocket.OPEN) {
            // Connection established
            console.log("connection established.");
        } else if (status === WebSocket.CLOSED) {
            // Connection closed
            console.log("connection closed.");
        }
    })
}
function isBotconnected() {
    console.log("check if bot is connected or not");
    return Bots.isConnected(); // false
}

function sendMessage(msg) {
    console.log("msg:" + msg);
    Bots.sendMessage(msg);
}

function networkStatusUpdate(status) {
    console.log("networkStatusUpdate called");
    document.getElementById("networkStatus").innerHTML = "Network status: " + status;
}

// Create a new list item when clicking on the "Add" button
function newElement() {
    if (isBotconnected() == false) {
        alert("Please ensure the bot is connnected before sending the message..");
        return;
    }

    var inputValue = document.getElementById("myInput").value;
    updateMessageinList(inputValue)
    sendMessage(inputValue);

}

function updateMessageinList(inputValue) {
    var li = document.createElement("li");
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') {
        alert("You must write something!");
    } else {
        document.getElementById("myUL").appendChild(li);
    }
    document.getElementById("myInput").value = "";
}

