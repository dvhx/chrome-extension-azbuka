// Options page
// linter: ngspicejs-lint --browser
// global: chrome, SC
"use strict";

import {guessUserLanguage} from './utils_module.js';

var AZ = globalThis.AZ || {};

window.addEventListener('DOMContentLoaded', function () {
    AZ.e = SC.elementsWithId();

    // load settings
    chrome.storage.local.get('dst_lang', function (o) {
        AZ.dst_lang = o.dst_lang || '';
        AZ.e.dst_lang.value = AZ.dst_lang;
        AZ.e.guessed_language.textContent = guessUserLanguage(AZ.dst_lang) || 'interslavic_latin';
    });

    // Change dst language
    AZ.e.dst_lang.addEventListener('change', function () {
        AZ.dst_lang = AZ.e.dst_lang.value;
        chrome.storage.local.set({dst_lang: AZ.dst_lang});
        chrome.runtime.sendMessage({dst_lang: AZ.dst_lang, text: "abc"}, console.log);
    });
});

chrome.runtime.onMessage.addListener(function (a) {
    if (a === 'translate_selection' || a === 'translate_page') {
        alert('Azbuka extension only works on normal pages (https://...) not in extensions pages (chrome-extension://...)');
        return false;
    }
});
