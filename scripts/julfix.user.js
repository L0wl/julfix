// ==UserScript==
// @name         JULFIX
// @namespace    https://github.com/L0wl/JULFIX
// @version      0.0.4
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

(function () {
    'use strict';

    const pathRegex = /\/(?:u\/\d+\/)?task\/\d+$/;
    let lastPath = location.pathname;
    let button = null;
    let projectName = null;
    const buttonText = 'Download';
    const conatinerClass = '.panel-button-right-container';
    const sourceButtonClass = '.nav-button';

    function isValidTaskPage() {
        const regexValid = pathRegex.test(location.pathname);
        return regexValid;
    }

    function isMonacoReady() {
        const ready = (
            typeof monaco !== 'undefined' &&
            typeof monaco.editor !== 'undefined' &&
            typeof monaco.editor.getDiffEditors === 'function'
        );
        return ready;
    }

    function waitForMonacoToRender(callback, timeout = 15000) {
        const startTime = Date.now();

        const observer = new MutationObserver(() => {
            const ready = (
                document.querySelector('.content-body') !== null &&
                document.querySelector('.code-panel') !== null &&
                document.querySelector('.monaco-diff-editor') !== null &&
                document.querySelector('.source-text-repo') !== null &&
                document.querySelector('.source-text-org') !== null &&
                monaco?.editor?.getDiffEditors?.().length > 0
            );
            if (ready) {
                observer.disconnect();
                projectName = document.querySelector('.source-text-repo')?.textContent;
                callback();
            } else if (Date.now() - startTime > timeout) {
                observer.disconnect();
                projectName = null;
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function injectButton() {
        if (button) return;
        const panelContainer = document.querySelector(conatinerClass);
        const sourceButton = panelContainer?.querySelector(sourceButtonClass);
        
        let appendElementContainer = null;
        button = document.createElement('button');

        if (panelContainer && sourceButton) {
            appendElementContainer = panelContainer;
            Array.from(sourceButton.attributes).forEach(attr => {
                button.setAttribute(attr.name, attr.value);
            });
            button.className = sourceButton.className;
            const span = document.createElement('span');
            span.textContent = buttonText;
            button.appendChild(span);
        } else {
            appendElementContainer = document.body;
            button.textContent = buttonText;
            button.style = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        z-index: 9999;
                        padding: 8px 13px;
                        background-color: #28252b;
                        font-size: 1rem;
                        display: flex;
                        font-weight: 400;
                        font-family: "Google Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                        color: #e6e1ff;
                        border: 1px solid #3a353f;
                        border-radius: 6px;
                        cursor: pointer;
                    `;
        }

        button.addEventListener('click', async function () {
            await downloadTaskCode();
        });

        appendElementContainer.appendChild(button);
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
            } catch { }
        }

        if (added === 0) return;
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.href = URL.createObjectURL(blob);
        link.download = (projectName !== null) ? (`${projectName}_${timestamp}.zip`) : (`jules_sources_${timestamp}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function onPageChange() {
        removeButton();
        if (!isValidTaskPage()) return;
        const waitForMonacoOrGiveUp = setInterval(() => {
            if (isMonacoReady()) {
                clearInterval(waitForMonacoOrGiveUp);
                waitForMonacoToRender(() => {
                    injectButton();
                });
            }
        }, 5000);
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

    patchHistoryAPI();
    onPageChange();
})();