// ==UserScript==
// @name         JULFIX
// @namespace    https://github.com/L0wl/JULFIX
// @version      0.0.1
// @description  Fix repo downloading issues, just by one click
// @author       L0wl
// @match        https://jules.google.com/task/*
// @icon         https://www.gstatic.com/labs-code/code-app/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function addButton() {
        const button = document.createElement('button');
        button.textContent = 'Download ZIP';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

        button.addEventListener('click', downloadTaskCode);
        document.body.appendChild(button);
    }

    function areDependenciesReady() {
        const monacoReady = typeof monaco !== 'undefined' && typeof monaco.editor !== 'undefined';
        const jszipReady = typeof JSZip !== 'undefined';
        return monacoReady && jszipReady;
    }

    function checkModelState(model) {
        return (model && model.modified && typeof model.modified.isDisposed === 'function' && !model.modified.isDisposed());
    }

    async function downloadTaskCode() {
        if (!areDependenciesReady()) {
            console.log(`Unable to start downloading process...\nReload page or wait for it fully interface load`);
            return;
        }

        console.log('Collecting all source files');
        const zip = new JSZip();
        const diffEditors = monaco.editor.getDiffEditors();
        let filesAdded = 0;

        const pathExtractionRegex = /^\/modified\/\d+\/\d+\//;
        const pathCumulativeSegment = 'modified/cumulative/';
        for (let i = 0; i < diffEditors.length; i++) {
            const editor = diffEditors[i];
            try {
                const model = editor.getModel();
                if (model && model.modified && checkModelState(model)) {
                    const code = model.modified.getValue();
                    const uri = model.modified.uri;

                    if (uri && uri.path) {
                        let relativePath = uri.path.replace(pathExtractionRegex, '');
                        if (relativePath.startsWith('/')) {
                            relativePath = relativePath.substring(1);
                        }
                        if (relativePath.startsWith(pathCumulativeSegment)) {
                            continue;
                        }
                        if (relativePath) {
                            console.log(`Collected file: ${relativePath} | ${code.length}`);
                            zip.file(relativePath, code);
                            filesAdded++;
                        } 
                    } 
                }
            } catch {
            }
        }

        if (filesAdded === 0) {
            return;
        }

        console.log(`Collect stage finished. Collected ${filesAdded} files.`);

        try {
            const content = await zip.generateAsync({type: "blob"});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            link.download = `jules_modified_code_${timestamp}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error(`Error while generating archive: ${error}`);
        }
    }

    function tryAddButtonWhenReady() {
        const maxCheckingAttempts = 60; 
        const checkingInterval = 500;
        let attempts = 0;

        function check() {
            if (areDependenciesReady()) {
                addButton();
            } else {
                attempts++;
                if (attempts < maxCheckingAttempts) {
                    setTimeout(check, checkingInterval);
                }
            }
        }
        check();
    }

    tryAddButtonWhenReady();
})();