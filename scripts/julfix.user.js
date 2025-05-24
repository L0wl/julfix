// ==UserScript==
// @name         JULFIX
// @namespace    https://github.com/L0wl/JULFIX
// @version      0.0.2
// @description  Fix repo downloading issues, just by one click
// @author       L0wl
// @homepageURL  https://github.com/L0wl/julfix
// @match        https://jules.google.com/*
// @icon         https://www.gstatic.com/labs-code/code-app/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @updateURL    https://github.com/L0wl/julfix/raw/refs/heads/master/scripts/julfix.user.js
// @downloadURL  https://github.com/L0wl/julfix/raw/refs/heads/master/scripts/julfix.user.js
// @supportURL   https://github.com/L0wl/julfix/issues
// @grant        none
// @run-at       document-body
// @sandbox      ISOLATED_WORLD
// @unwrap
// ==/UserScript==

(async function () {
    'use strict';

    let lastPath = location.pathname;
    let button = null;
    let observer = null;
    let stateInterval = null;
    const pathRegex = /^\/task\/\d+$/;

    function isValidTaskPage() {
        return pathRegex.test(location.pathname);
    }

    function patchHistoryAPI() {
        const origPushState = history.pushState;
        const origReplaceState = history.replaceState;

        function handleChange() {
            if (location.pathname !== lastPath) {
                lastPath = location.pathname;
                onPageChange();
            }
        }

        history.pushState = function (...args) {
            origPushState.apply(this, args);
            handleChange();
        };

        history.replaceState = function (...args) {
            origReplaceState.apply(this, args);
            handleChange();
        };

        window.addEventListener('popstate', handleChange);
    }

    function areDependenciesReady() {
        return typeof monaco !== 'undefined' &&
               typeof monaco.editor !== 'undefined' &&
               typeof JSZip !== 'undefined';
    }

    function getAvailableTabsCount() {
        try {
            return monaco.editor.getDiffEditors().length;
        } catch {
            return 0;
        }
    }

    function injectButton() {
        if (button) return;

        button = document.createElement('button');
        button.textContent = 'Download ZIP';
        button.style = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            padding: 10px 15px;
            background-color: #715cd7;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        button.addEventListener('click', async function () { downloadTaskCode(); });
        document.body.appendChild(button);
    }

    function removeButton() {
        if (button) {
            button.remove();
            button = null;
        }
    }

    async function downloadTaskCode() {
        const zip = new JSZip();
        const editors = monaco.editor.getDiffEditors();
        const pathExtractionRegex = /^\/modified\/\d+\/\d+\//;
        const pathCumulativeSegment = 'modified/cumulative/';
        let added = 0;

        for (let editor of editors) {
            try {
                const model = editor.getModel();
                if (model && model.modified && typeof model.modified.isDisposed === 'function' && !model.modified.isDisposed()) {
                    const code = model.modified.getValue();
                    const uri = model.modified.uri;
                    let relativePath = uri.path.replace(pathExtractionRegex, '');
                    if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);
                    if (relativePath.startsWith(pathCumulativeSegment)) continue;
                    if (relativePath) {
                        zip.file(relativePath, code);
                        added++;
                    }
                }
            } catch {}
        }

        if (added === 0) return;

        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.href = URL.createObjectURL(blob);
        link.download = `jules_modified_code_${timestamp}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function startReactiveWatcher() {
        if (stateInterval) clearInterval(stateInterval);
        if (observer) observer.disconnect();

        stateInterval = setInterval(() => {
            if (!isValidTaskPage()) {
                removeButton();
                return;
            }

            if (areDependenciesReady() && getAvailableTabsCount() > 0) {
                injectButton();
            } else {
                removeButton();
            }
        }, 750);

        observer = new MutationObserver(() => {
            if (!isValidTaskPage()) {
                removeButton();
            }
        });

        observer.observe(document.body, { childList: true, subtree: false });
    }

    function stopReactiveWatcher() {
        if (stateInterval) clearInterval(stateInterval);
        if (observer) observer.disconnect();
        removeButton();
    }

    function onPageChange() {
        stopReactiveWatcher();

        if (isValidTaskPage()) {
            startReactiveWatcher();
        }
    }

    patchHistoryAPI();
    onPageChange();
})();