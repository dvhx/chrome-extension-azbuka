// Various functions
// linter: ngspicejs-lint --browser
// global: navigator
"use strict";

import {
    dictionary_to,
    dictionary_from
} from "./dictionary.js";

export function guessUserLanguage(aUserChosenLanguage, aSampleLanguage) {
    // Guess user's language from navigator settings or opposite of sample
    if (aUserChosenLanguage) {
        return aUserChosenLanguage;
    }
    // navigator.languages
    var known = {
            be: "belarusian",
            bg: "bulgarian",
            bs: "bosnian",
            hr: "croatian",
            cs: "czech",
            mk: "macedonian",
            pl: "polish",
            ru: "russian",
            sr: "serbian",
            sk: "slovak",
            sl: "slovenian",
            uk: "ukrainian"
        },
        latin = ['czech', 'slovak', 'croatian', 'bosnian', 'slovenian', 'polish'];
    for (var i = 0; i < navigator.languages.length; i++) {
        if (known.hasOwnProperty(navigator.languages[i])) {
            return known[navigator.languages[i]];
        }
    }
    if (latin[aSampleLanguage]) {
        return "interslavic_latin";
    }
    return "interslavic_cyrillic";
}

var common_words = {"belarusian":{"і":1,"на":1,"з":1,"ў":1,"не":1,"у":1,"што":1,"як":1,"да":1,"ён":1,"яго":1,"я":1,"за":1,"ад":1,"гэта":1,"але":1,"па":1,"калі":1,"ня":1,"ж":1},"bosnian":{"je":1,"i":1,"u":1,"se":1,"su":1,"na":1,"da":1,"od":1,"za":1,"sa":1,"koji":1,"kao":1,"a":1,"U":1,"do":1,"ili":1,"iz":1,"godine":1,"što":1,"s":1},"bulgarian":{"на":1,"и":1,"да":1,"от":1,"се":1,"в":1,"за":1,"не":1,"е":1,"с":1,"по":1,"си":1,"ще":1,"или":1,"че":1,"като":1,"са":1,"а":1,"които":1,"му":1},"croatian":{"i":1,"u":1,"je":1,"se":1,"da":1,"na":1,"ne":1,"za":1,"od":1,"sup":1,"su":1,"s":1,"što":1,"to":1,"koji":1,"će":1,"on":1,"ja":1,"kao":1,"ga":1},"czech":{"a":1,"v":1,"se":1,"na":1,"je":1,"s":1,"z":1,"do":1,"pro":1,"k":1,"i":1,"ve":1,"o":1,"to":1,"jako":1,"že":1,"nebo":1,"po":1,"u":1,"jsou":1},"interslavic_cyrillic":{"Меджусловјанскы":1,"јест":1,"помочны":1,"језык":1,"кторы":1,"словјани":1,"различных":1,"народов":1,"користајут":1,"до":1,"комуникације":1,"једин":1,"с":1,"другым":1,"пише":1,"се":1,"равно":1,"латиницеју":1},"interslavic_latin":{"jest":1,"věstnik":1,"člankov":1,"od":1,"različnyh":1,"avtorov":1,"ktori":1,"pišut":1,"jedino":1,"medžuslovjansky":1,"v":1,"latinici":1,"ili":1,"kirilici":1,"Teksty":1,"iz":1,"servera":1,"služet":1,"netoliko":1,"do":1},"macedonian":{"на":1,"и":1,"во":1,"за":1,"се":1,"од":1,"да":1,"со":1,"е":1,"дека":1,"ќе":1,"не":1,"што":1,"го":1,"ги":1,"кои":1,"ја":1,"како":1,"по":1,"до":1},"montenegrin":{"se":1,"i":1,"vid":1,"u":1,"je":1,"na":1,"ne":1,"su":1,"od":1,"s":1,"da":1,"ili":1,"kao":1,"a":1,"koji":1,"za":1,"riječi":1,"piše":1,"kad":1,"ako":1},"polish":{"i":1,"się":1,"w":1,"nie":1,"na":1,"z":1,"do":1,"to":1,"a":1,"że":1,"o":1,"jak":1,"co":1,"tak":1,"ale":1,"za":1,"jest":1,"po":1,"go":1,"od":1},"russian":{"и":1,"в":1,"не":1,"на":1,"что":1,"с":1,"я":1,"а":1,"его":1,"по":1,"он":1,"к":1,"но":1,"то":1,"как":1,"о":1,"это":1,"за":1,"из":1,"же":1},"serbian":{"и":1,"у":1,"је":1,"се":1,"да":1,"на":1,"а":1,"не":1,"од":1,"за":1,"су":1,"што":1,"па":1,"ти":1,"то":1,"из":1,"ми":1,"кад":1,"са":1,"о":1},"slovak":{"a":1,"sa":1,"v":1,"na":1,"to":1,"že":1,"s":1,"z":1,"do":1,"o":1,"ako":1,"i":1,"za":1,"the":1,"k":1,"aj":1,"si":1,"tak":1,"ale":1,"by":1},"slovenian":{"je":1,"in":1,"se":1,"v":1,"da":1,"na":1,"ne":1,"so":1,"pa":1,"bi":1,"si":1,"ki":1,"ni":1,"za":1,"z":1,"po":1,"ga":1,"sem":1,"še":1,"s":1},"ukrainian":{"і":1,"в":1,"на":1,"не":1,"з":1,"що":1,"та":1,"а":1,"до":1,"у":1,"й":1,"про":1,"як":1,"я":1,"за":1,"його":1,"він":1,"по":1,"то":1,"від":1}};

export function guessLanguage(aSample) {
    // guess language by analyzing sample
    var tokens = aSample.toString().split('');
    var lang = {},
        uni = {};
    var k;
    //console.log(dictionary_from);
    // count matched chars for each language
    tokens.forEach((c) => {
        //console.log('c', c);
        //uni[c] = 1;
        for (k in dictionary_from) {
            if (dictionary_from[k][c] !== undefined) {
                uni[dictionary_from[k][c].length] = c;
                lang[k] = lang[k] || 0;
                lang[k]++;
            } else {
                // lose point if char is in some other dictionary
                var in_other = false;
                for (var other in dictionary_from) {
                    if (k !== other && !in_other) {
                        if (dictionary_from[other][c]) {
                            //console.log(c, 'je v', other, 'odoberam bod', k);
                            in_other = true;
                        }
                    }
                }
                if (in_other) {
                    lang[k] = lang[k] || 0;
                    lang[k]--;
                }
            }
        }
    });
    // check for most common words too
    tokens = aSample.toLowerCase().split(/[\ \!\?\,\.\-]/g);
    var score = {};
    for (var l in common_words) {
        for (var w = 0; w < tokens.length; w++) {
            score[l] = score[l] || 0;
            if (common_words[l][tokens[w]]) {
                score[l]++;
            } else {
                //score[l]--;
            }
        }
    }
    console.log(score);
    console.log(lang);

    //console.log(lang);
    //console.log(uni);
    //console.log(Object.keys(uni).sort().join(' '));
    // in case of tie, choose bigger
    var population = {
        "belarusian": 9100000,
        "bosnian": 3412000,
        "bulgarian": 6400000,
        "croatian": 3800000,
        "czech": 10900000,
        "macedonian": 1800000,
        "montenegrin": 620000,
        "polish": 36700000,
        "serbian": 6600000,
        "slovak": 5400000,
        "slovenian": 2100000,
        "ukrainian": 37000000
    };
    // find language with highest match
    var ret;
    var best = 0;
    var best_population = 0;
    for (k in lang) {
        if (lang[k] > best || (lang[k] >= best && population[k] > best_population)) {
            best = lang[k];
            best_population = population[k] || 0;
            ret = k;
        }
    }
    return ret;
}

export function isLatin(aText) {
    // Return true if source is mostly latin
    var latin = aText.match(/[\u0041-\u021b]/g),
        cyrillic = aText.match(/[\u0400-\u04FF]/g);
    latin = latin ? latin.length : 0;
    cyrillic = cyrillic ? cyrillic.length : 0;
    return latin > cyrillic;
}

globalThis.AZ = globalThis.AZ || {};
globalThis.AZ.dictionary_to = dictionary_to;
globalThis.AZ.dictionary_from = dictionary_from;
globalThis.AZ.guessUserLanguage = guessUserLanguage;
globalThis.AZ.guessLanguage = guessLanguage;
globalThis.AZ.isLatin = isLatin;
