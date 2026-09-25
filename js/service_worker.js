// Service worker with shared dictionary and all the logic to keep content scripts simple
// linter: ngspicejs-lint --browser
// global: chrome
"use strict";

console.log("azbuka service_worker.js");

var AZ = globalThis.AZ || {};

import {translate,translateMissing} from "./translate.js";
import {dictionary_to,dictionary_from} from "./dictionary.js";
import {guessLanguage, guessUserLanguage, isLatin} from './utils_module.js';
console.log(dictionary_to);

AZ.dictionary_to = dictionary_to;
AZ.dictionary_from = dictionary_from;
AZ.guessLanguage = guessLanguage;
AZ.guessUserLanguage = guessUserLanguage;
AZ.isLatin = isLatin;
AZ.translate = translate;
AZ.translateMissing = translateMissing;

// Read user-prefered language
AZ.language = "";
chrome.storage.local.get(["language"], function (o) {
    AZ.language = o.language;
});

// create context menus
chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
        "id": "translate_page",
        "title": "Azbuka (entire page)",
        "contexts": ["page"]
    });
    chrome.contextMenus.create({
        "id": "translate_selection",
        "title": "Azbuka (selection)",
        "contexts": ["selection"]
    });
});

// callback for context menus
chrome.contextMenus.onClicked.addListener(function (aMenuItem, aTab) {

    var onReceive = function (aDigest) {
        console.log('onReceive', aDigest, 'language', AZ.language);
        // receive digest object for translation
        if (!aDigest) {
            console.log('Received null digest');
            return;
        }
        // guess sample language
        var src_lang = guessLanguage(Object.keys(aDigest).join('').substr(0, 15000));
        // guess target language
        var dst_lang = guessUserLanguage(AZ.language, src_lang);
        console.log({src_lang, dst_lang});
        // translate each key in digest
        for (var k in aDigest) {
            if (aDigest.hasOwnProperty(k)) {
                console.log('k', k);
                // from source language to internal form
                var f = translate(k, dictionary_from[src_lang]);
                // from internal for to destination language
                var t = translate(f, dictionary_to[dst_lang]);
                // set translation
                aDigest[k] = t;
            }
        }
        console.log('digest', aDigest);
        // send translation back to that tab
        chrome.tabs.sendMessage(aTab.id, aDigest);
    };

    // send to tab what context menu item id was clicked
    chrome.tabs.sendMessage(aTab.id, aMenuItem.menuItemId, onReceive);
});

// Open options page on install
chrome.runtime.onInstalled.addListener(function (aDetail) {
    console.log('onInstalled', aDetail);
    if (aDetail.reason === "install") {
        chrome.tabs.create({url: "options.html"}, function (tab) {
            console.log("New tab launched", tab);
        });
    }
});

// Receiving messages from popup for translation
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.dst_lang) {
        AZ.language = message.dst_lang;
        console.log('update language to', AZ.language);
    }
    if (message.text) {
        console.log('from popup', message);
        var src_lang = message.src_lang || guessLanguage(message.text);
        var dst_lang = message.dst_lang || guessUserLanguage(AZ.language, src_lang);
        var i = translate(message.text, dictionary_from[src_lang]);
        var d = translate(i, dictionary_to[dst_lang]);
        sendResponse({ src_lang, dst_lang, text: d});
        return true;
    }
});

