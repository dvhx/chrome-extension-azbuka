// Replacing selected text on page (only text elements so that it wont break layout)
// code from http://stackoverflow.com/users/96100/tim-down
// http://stackoverflow.com/questions/7781963/js-get-array-of-all-selected-nodes-in-contenteditable-div
// linter: ngspicejs-lint --browser
// global:
"use strict";

var AZ = window.AZ || {};

console.log("az selection.js");

AZ.getOrReplaceSelection = (function () {

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

    function getSelectedNodes() {
        // get selected nodes
        if (window.getSelection) {
            var sel = window.getSelection();
            if (!sel.isCollapsed) {
                return getRangeSelectedNodes(sel.getRangeAt(0));
            }
        }
        return [document.body];
    }

    function getSelectedTextNodes(aReplaceValues) {
        // return only selected text nodes, optionally replace their values
        var s = getSelectedNodes(),
            t = [],
            i,
            v,
            n,
            walk;

        // is selection is whole body, convert it to all text nodes
        if ((s.length === 1) && (s[0] === document.body)) {
            s = [];
            walk = document.createTreeWalker(document.body, window.NodeFilter.SHOW_TEXT, null, false);
            n = walk.nextNode();
            while (n) {
                if (n && n.parentNode && n.parentNode.nodeName !== 'STYLE' && n.parentNode.nodeName !== 'SCRIPT') {
                    s.push(n);
                }
                n = walk.nextNode();
            }
            //console.log('zzz', s.length);
        }

        for (i = s.length - 1; i >= 0; i--) {
            if (s[i] && s[i].nodeType === 3) {
                t.push(s[i].nodeValue);
                // if aReplaceValues is set, use it to replace values
                if (aReplaceValues) {
                    // skip empty nodes (e.g EOL)
                    if (s[i].nodeValue.trim() !== '') {
                        for (v in aReplaceValues.original) {
                            if (aReplaceValues.original.hasOwnProperty(v)) {
                                if (s[i].nodeValue === aReplaceValues.original[v]) {
                                    s[i].textContent = aReplaceValues.translation[v];
                                }
                            }
                        }
                    }
                }
            }
        }
        if (t.length <= 0) {
            console.warn('empty selection');
        }
        return t;
    }

    return getSelectedTextNodes;

}());

