// Fetch text from server
// linter: ngspicejs-lint --browser
"use strict";

var SC = window.SC || {};

SC.fetch = function (aUrl, aCallback) {
    // fetch text from server
    fetch(aUrl).then((response) => response.text()).then(aCallback);
};