// Service worker with shared dictionary and all the logic to keep content scripts simple
// linter: ngspicejs-lint --browser
// global: chrome
"use strict";

console.log("azbuka service_worker.js");

var AZ = globalThis.AZ || {};

import {translate,translateMissing} from "./translate.js";
import {dictionary_to,dictionary_from} from "./dictionary.js";
import {guessLanguage, guessUserLanguage, isLatin} from './utils_module.js';

AZ.dictionary_to = dictionary_to;
AZ.dictionary_from = dictionary_from;
AZ.guessLanguage = guessLanguage;
AZ.guessUserLanguage = guessUserLanguage;
AZ.isLatin = isLatin;
AZ.translate = translate;
AZ.translateMissing = translateMissing;

// Read user-prefered language
AZ.dst_lang = "";
chrome.storage.local.get(["dst_lang"], function (o) {
    AZ.dst_lang = o.dst_lang;
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

// Execute multiple script files
AZ.executeScripts = async function (tabId, scripts) {
    try {
        for (const fn of scripts) {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [fn]
            });
        }
        //console.log('executed', tabId, scripts);
    } catch (err) {
        console.error('failed to inject scripts:', err);
    }
};

// callback for context menus
chrome.contextMenus.onClicked.addListener(function (aMenuItem, aTab) {
    console.log('context menu', aMenuItem, aTab.id);
    // translating selection
    if (aMenuItem.menuItemId === 'translate_selection') {
        AZ.executeScripts(
            aTab.id,
            [
                // selection handling library
                "/js/selection.js",
                // get selection, send it to background (here), wait for response, replace selection
                "/js/content_active_tab.js"
            ]
        );
    }
    // translating entire page
    if (aMenuItem.menuItemId === 'translate_page') {
        AZ.executeScripts(
            aTab.id,
            [
                // selection handling library
                "/js/selection.js",
                // get selection, send it to background (here), wait for response, replace selection
                "/js/content_active_tab_page.js"
            ]
        );
    }
    /*
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

        //chrome.tabs.sendMessage(aTab.id, aDigest);
    };

    // send to tab what context menu item id was clicked
    chrome.tabs.sendMessage(aTab.id, aMenuItem.menuItemId, onReceive);
    */
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //console.log('request', request);
    chrome.storage.local.get(['src_lang', 'dst_lang'], function (config) {
        //console.log('config', config);

        // content script is sending nodes for translation
        if (request.type === 'nodes') {
            var response = {
                "type": "replaceSelection",
                "original": [],
                "translation": []
            };
            var sample = request.data.join(' ');
            if (sample.length > 20000) {
                sample = sample.substr(Math.round(sample.length / 2), 20000);
            }
            //console.log('rrr', request.data.length, sample.length);
            var src_lang = request.src_lang /*|| config.src_lang*/ || guessLanguage(sample) || "interslavic_latin";
            var dst_lang = request.dst_lang || config.dst_lang || guessUserLanguage(AZ.language, src_lang) || "interslavic_latin";
            //console.log({src_lang,dst_lang,sample});
            response.src_lang = src_lang;
            response.dst_lang = dst_lang;
            for (var i in request.data) {
                if (request.data.hasOwnProperty(i)) {
                    var m = translate(request.data[i], dictionary_from[src_lang]);
                    var d = translate(m, dictionary_to[dst_lang]);
                    response.original.push(request.data[i]);
                    response.translation.push(d);
                }
            }
            //sendResponse({ src_lang, dst_lang, text: d});
            sendResponse(response);
            return;
        }
    });
/*
    if (request.dst_lang) {
        AZ.language = request.dst_lang;
        console.log('update language to', AZ.language);
    }
    if (request.text) {
        console.log('from popup', message);
        var src_lang = request.src_lang || guessLanguage(request.text) || "interslavic_latin";
        var dst_lang = request.dst_lang || guessUserLanguage(AZ.language, src_lang) || "interslavic_latin";
        console.log({src_lang,dst_lang});
        var i = translate(request.text, dictionary_from[src_lang]);
        var d = translate(i, dictionary_to[dst_lang]);
        sendResponse({ src_lang, dst_lang, text: d});
        return true;
    }
*/
    return true;
});

