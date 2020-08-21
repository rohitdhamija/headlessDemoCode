'use strict';

// Set client auth mode - true to enable client auth, false to disable it
const isClientAuthEnabled = false;

/**
 * A function mocking an endpoint call to backend to provide authentication token
 * The recommended behaviour is fetching the token from backend server
 *
 * @returns {Promise} Promise to provide a signed JWT token
 */
const mockApiCall = () => {
    return new Promise((resolve) => {
        setTimeout(function() {
            const now = Math.floor(Date.now() / 1000)
            const payload = {
                iat: now,
                exp: now + 3600,
                channelId: '<channelID>',
                userId: '<userID>'
            };
            const SECRET = '<channel-secret>';

            // An unimplemented function generating signed JWT token with given header, payload, and signature
            const token = generateJWTToken({ alg: 'HS256', typ: 'JWT' }, payload, SECRET);
            resolve(token);
        }, Math.floor(Math.random() * 1000) + 1000);
    });
};

/**
 * Unimplemented function to generate signed JWT token. Should be replaced with
 * actual method to generate the token on the server.
 *
 * @param {object} header
 * @param {object} payload
 * @param {string} signature
 */
const generateJWTToken = (header, payload, signature) => {
    throw new Error("Method not implemented.");
};

/**
 * Function to generate JWT tokens. It returns a Promise to provide tokens.
 * The function is passed to SDK which uses it to fetch token whenever it needs
 * to establish connections to chat server
 *
 * @returns {Promise} Promise to provide a signed JWT token
 */
const generateToken = () => {
    return new Promise((resolve) => {
        mockApiCall('https://mockurl').then((token) => {
            resolve(token);
        });
    });
};

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
            URI: 'idcs-oda-1b53c857f8724ac1a72cd710c0f5d5be-s0.data.digitalassistant.oci.oc-test.com',                               // ODA URI, only the hostname part should be passed, without the https://
            clientAuthEnabled: isClientAuthEnabled,     // Enables client auth enabled mode of connection if set true
            channelId: 'f8cc646f-e1ad-4aa9-aa94-b72a24db00ed',                   // Channel ID, available in channel settings in ODA UI
                               // User ID, optional field to personalize user experience
            enableAutocomplete: true,                   // Enables autocomplete suggestions on user input
            enableBotAudioResponse: true,               // Enables audio utterance of skill responses
            enableClearMessage: true,                   // Enables display of button to clear conversation
            enableSpeech: true,                         // Enables voice recognition
            enableTimestamp: false,                     // Show timestamp with each message
            speechLocale: WebSDK.SPEECH_LOCALE.EN_US,   // Sets locale used to speak to the skill, the SDK supports EN_US, FR_FR, and ES_ES locales for speech
            showConnectionStatus: true,                 // Displays current connection status on the header
            i18n: {                                     // Provide translations for the strings used in the widget
                en: {                                   // en locale, can be configured for any locale
                    chatTitle: '<Chat Header Title>'    // Set title at chat header
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

        // Connect to the ODA
        Bots.connect();

        // Create global object to refer Bots
        window[name] = Bots;
    }, 0);
};
