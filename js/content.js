// Content script (get selection, send it for translation, receive translation, replace selection)
"use strict";
// globals: chrome

//console.log('az js/content.js');

var AZ = AZ || {};

AZ.selection = null;
AZ.digest = null;
AZ.sender = null;

AZ.onMessage = function (aMessage, aSender, aSendResponse) {
    // receive message from background script (either menu item id or translation)
    //console.log('AZ js/content.js onMessage', aMessage, aSender);
    AZ.sender = aSender;
    // string messages are menu item commands
    if (typeof aMessage === 'string') {
        switch (aMessage) {
        case "translate_page":
            // translate entire page
            AZ.selection = AZ.getAllTextNodes();
            AZ.digest = AZ.selectionDigest(AZ.selection);
            aSendResponse(AZ.digest);
            break;
        case "translate_selection":
            // translate selection
            AZ.selection = AZ.getSelection();
            AZ.digest = AZ.selectionDigest(AZ.selection);
            aSendResponse(AZ.digest);
            break;
        }
        return;
    }
    // object is translation sent back from background script
    if (typeof aMessage === 'object') {
        AZ.digest = aMessage;
        AZ.replaceSelection(AZ.selection, AZ.digest);
    }
};

chrome.runtime.onMessage.addListener(AZ.onMessage);

