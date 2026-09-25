// Add capitalized words to lowercase-only dicitonary {foo:bar} => {foo:bar, Foo:Bar, FOO:BAR}
// linter: ngspicejs-lint
"use strict";

function capitalizeText(aText) {
    // Capitalize string (foo=>Foo)
    return aText && aText[0].toUpperCase() + aText.slice(1);
}

function capitalizeDict(aDict) {
    // Capitalize one dicitonary {foo:bar} => {foo:bar, Foo:Bar, FOO:BAR}
    var ret = {};
    for (var w in aDict) {
        // foo:bar
        ret[w] = aDict[w];
        // FOO:BAR
        ret[w.toUpperCase()] = aDict[w].toUpperCase();
        // Foo:Bar
        if (!w.startsWith("'")) {
            ret[capitalizeText(w)] = capitalizeText(aDict[w]);
        }
    }
    return ret;
}

export function capitalize(aDictionaries) {
    // Capitalize all dictionaries
    var ret = {};
    for (var d in aDictionaries) {
        ret[d] = capitalizeDict(aDictionaries[d]);
    }
    return ret;
}
