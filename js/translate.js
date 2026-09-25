// Translate text using dictionary {"si": "š", "sic": "šic"}
// linter: ngspicejs-lint --browser
// global:
"use strict";

var missing = {};

export function translateMissing() {
    // Return which chars were not found in recent translation
    delete missing["\n"];
    delete missing["'"];
    return missing;
}

export function translate(aText, aDictionary) {
    // Translate text using dictionary
    missing = {};
    const maxKeyLength = Math.max(
        0,
        ...Object.keys(aDictionary).map(k => k.length)
    );
    const result = [];
    for (let i = 0; i < aText.length; ) {
        let matched = false;
        for (let len = Math.min(maxKeyLength, aText.length - i); len >= 1; len--) {
            const candidate = aText.slice(i, i + len);
            if (Object.hasOwn(aDictionary, candidate)) {
                result.push(aDictionary[candidate]);
                i += len;
                matched = true;
                break;
            }
        }
        if (!matched) {
            missing[aText[i]] = missing[aText[i]] || 0;
            missing[aText[i]]++;
            result.push(aText[i]);
            i += 1;
        }
    }
    return result.join('');
}

