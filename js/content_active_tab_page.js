// Content script (send entire page to background, receive translation, render it)
// linter: ngspicejs-lint --browser
// global: chrome, AZ
"use strict";

console.log('az content_active_tab.js');

var lastResponse;

chrome.runtime.sendMessage({'type': 'nodes', 'data': AZ.getOrReplaceSelection()}, function (aResponse) {
    //console.log('aResponse', aResponse);
    console.log('azbuka ' + aResponse.src_lang + ' --> ' + aResponse.dst_lang, aResponse);
    AZ.getOrReplaceSelection(aResponse);
    lastResponse = aResponse;
});


