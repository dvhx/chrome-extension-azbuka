// Options page
// linter: ngspicejs-lint --browser
// global: chrome, SC
"use strict";

import {guessUserLanguage} from './utils_module.js';

var AZ = globalThis.AZ || {};

window.addEventListener('DOMContentLoaded', function () {
    AZ.e = SC.elementsWithId();

    // load settings
    chrome.storage.local.get('language', function (o) {
        AZ.language = o.language || '';
        AZ.e.native_language.value = AZ.language;
        AZ.e.guessed_language.textContent = guessUserLanguage(AZ.language) || 'interslavic_latin';
    });

    // Change native language
    AZ.e.native_language.addEventListener('change', function () {
        AZ.language = AZ.e.native_language.value;
        chrome.storage.local.set({language: AZ.language});
        chrome.runtime.sendMessage({dst_lang: AZ.language}, console.log);
    });
});

chrome.runtime.onMessage.addListener(function (a) {
    if (a === 'translate_selection' || a === 'translate_page') {
        alert('Azbuka extension only works on normal pages (https://...) not in extensions pages (chrome-extension://...)');
        return false;
    }
});
