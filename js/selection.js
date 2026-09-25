// Get selected nodes, replace them with translation
// linter: ngspicejs-lint --browser
// global:
"use strict";

//console.log('az js/selection.js');

var AZ = AZ || {};

AZ.getAllTextNodes = function () {
    // return all text nodes on page
    var walk = document.createTreeWalker(document.body, window.NodeFilter.SHOW_TEXT, null, false),
        n = walk.nextNode(),
        r = [];
    while (n) {
        r.push(n);
        n = walk.nextNode();
    }
    return r;
};

AZ.getSelection = function () {
    // return selected nodes

    function nextNode(node) {
        // auxiliary function
        if (node.hasChildNodes()) {
            return node.firstChild;
        }
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }

    function getRangeSelectedNodes(range) {
        // auxiliary function
        var node = range.startContainer,
            endNode = range.endContainer,
            rangeNodes = [];

        // Special case for a range that is contained within a single node
        if (node === endNode) {
            return [node];
        }

        // Iterate nodes until we hit the end container
        while (node && node !== endNode) {
            node = nextNode(node);
            rangeNodes.push(node);
        }

        // Add partially selected nodes at the start of the range
        node = range.startContainer;
        while (node && node !== range.commonAncestorContainer) {
            rangeNodes.unshift(node);
            node = node.parentNode;
        }

        return rangeNodes;
    }

    // get selected nodes
    if (window.getSelection) {
        var sel = window.getSelection();
        if (!sel.isCollapsed) {
            return getRangeSelectedNodes(sel.getRangeAt(0));
        }
    }
    return [];
};

AZ.selectionDigest = function (aSelection) {
    // selection is normally array of nodes, this cannot be serialized and sent
    // to background so we extract only string values of those nodes, this also
    // remove any duplicates
    var d = {}, i;
    for (i = 0; i < aSelection.length; i++) {
        if (aSelection[i].nodeValue) {
            d[aSelection[i].nodeValue] = '';
        }
        if (aSelection[i].placeholder) {
            d[aSelection[i].placeholder] = '';
        }
        if (aSelection[i].value) {
            d[aSelection[i].value] = '';
        }
        if (aSelection[i].title) {
            d[aSelection[i].title] = '';
        }
    }
    return d;
};

AZ.replaceSelection = function (aSelection, aDigest) {
    // finally this function will replace entire selection with digest values (the translation)
    // cancel selection to prevent certain bug with placeholder background color
    window.getSelection().empty();
    window.setTimeout(function () {
        var i;
        for (i = 0; i < aSelection.length; i++) {
            if (aSelection[i].nodeValue) {
                aSelection[i].nodeValue = aDigest[aSelection[i].nodeValue];
            }
            if (aSelection[i].placeholder) {
                aSelection[i].placeholder = aDigest[aSelection[i].placeholder];
            }
            if (aSelection[i].value) {
                aSelection[i].value = aDigest[aSelection[i].value];
            }
            if (aSelection[i].title) {
                aSelection[i].title = aDigest[aSelection[i].title];
            }
        }
    }, 300);
};

