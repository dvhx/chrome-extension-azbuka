// Popup page
// linter: ngspicejs-lint --browser
// global: chrome, SC
"use strict";

var AZ = window.AZ || {};

AZ.update = function () {
    // Translate text and show it
    var data = {
        src_lang: AZ.e.src_lang.value,
        dst_lang: AZ.e.dst_lang.value,
        text: AZ.e.text.value
    };
    chrome.storage.local.set(data);
    console.log('sending', data);
    chrome.runtime.sendMessage(data, function (aResponse) {
        console.log('response', aResponse);
        if (aResponse) {
            AZ.e.src_lang.title = 'Autodetected as ' + aResponse.src_lang;
            AZ.e.dst_lang.title = 'Autodetected as ' + aResponse.dst_lang;
            AZ.e.output.value = aResponse.text;
        }
    });
};

window.addEventListener('DOMContentLoaded', function () {
    AZ.e = SC.elementsWithId();

    // load settings
    chrome.storage.local.get(['src_lang','dst_lang','text'], function (o) {
        AZ.e.src_lang.value = o.src_lang || '';
        AZ.e.dst_lang.value = o.dst_lang || '';
        AZ.e.text.value = o.text || '';
        AZ.update();
    });

    // clear
    AZ.e.clear.onclick = function () { AZ.e.text.value = ''; AZ.e.focus(); };

    // text change
    AZ.e.text.oninput = AZ.update;

    // change combos
    AZ.e.src_lang.onchange = function () {
        chrome.storage.local.set({src_lang: AZ.e.src_lang.value});
        AZ.update();
    };
    AZ.e.dst_lang.onchange = function () {
        chrome.storage.local.set({dst_lang: AZ.e.dst_lang.value});
        AZ.update();
    };
});

chrome.runtime.onMessage.addListener(function (a) {
    if (a === 'translate_selection' || a === 'translate_page') {
        alert('Azbuka extension only works on normal pages (https://...) not in extensions pages (chrome-extension://...)');
        return false;
    }
});


