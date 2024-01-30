let zoomForSaveCnt = 1;
let zipSaveCnt = 1;
let elemsAdded = false;
let progressStep = 0;
let lastStep = 2;
const saveProgresses = document.getElementsByClassName("save_progress");
const lastSaveSteps = document.getElementsByClassName("last_save_step");

const saveButtonsEditor = document.getElementsByClassName('save_pdf_editor');
for (let h = 0; h < saveButtonsEditor.length; h++) {
    saveButtonsEditor[h].addEventListener("click", async function() {
        resetAllModes();  
        progressStep = 0; 
        lastStep = 2;
        zipSaveCnt = 1;
        elemsAdded = false;
        const saveWidgetCons = document.getElementsByClassName("save_widget_con");
        for (let i = 0; i < saveWidgetCons.length; i++) {
            saveWidgetCons[i].style.display = "flex";
        }
        const saveWidgets = document.getElementsByClassName("save_widget");
        for (let i = 0; i < saveWidgets.length; i++) {
            saveWidgets[i].style.display = "flex";
        }   
        for (let i = 0; i < saveProgresses.length; i++) {
            saveProgresses[i].style.innerText = `${progressStep}`;
        } 
        const editImgs = document.getElementsByClassName("editimg");
        if (editImgs.length > 0) { 
            lastStep = 7; 
            for (let i = 0; i < lastSaveSteps.length; i++) {
                lastSaveSteps[i].style.innerText = `${lastStep}`;
            } 
            zoomForSaveCnt = 1;
            let originalZoom = pdfState.zoom;
            pdfState.zoom = saveZoom;
            elemsAdded = true;

            // save step 1
            outputPDF = await PDFLib.PDFDocument.load(pdfState.originalPDFBytes);
            progressStep = 1;
            for (let i = 0; i < saveProgresses.length; i++) {
                saveProgresses[i].style.innerText = `${progressStep}`;
            } 

            // save step 2
            zoomForSave().then(function(step) {
                progressStep = step;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 
                zoomForSaveCnt++;

                // save step 3
                return canvasToImage();
            }).then(function(step) {
                progressStep = step;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 

                // save step 4
                return outputPDF.save();
            }).then(function(savedPDF) {
                progressStep = 4;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 
                pdfState.existingPDFBytes = savedPDF;

                // save step 5
                return compressToZip();
            }).then(function(blob) { 
                progressStep = 5;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 
                
                // save step 6
                return downloadPDF(blob);
            }).then(function(step) {
                progressStep = step;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 
                pdfState.zoom = originalZoom;

                // save step 7
                return zoomForSave();
            }).then(function(message4) {
                progressStep = step;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 
                for (let i = 0; i < saveWidgetCons.length; i++) {
                    saveWidgetCons[i].style.display = "none";
                }
                for (let i = 0; i < saveWidgets.length; i++) {
                    saveWidgets[i].style.display = "none";
                }
            });
        } else {
            lastStep = 2; 
            for (let i = 0; i < lastSaveSteps.length; i++) {
                lastSaveSteps[i].style.innerText = `${lastStep}`;
            }
            elemsAdded = false;

            // save step 1
            compressToZip().then(function(blob) {
                progressStep = 1;
                zipSaveCnt++;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 

                // save step 2
                return downloadPDF(blob);
            }).then(function(step) {
                progressStep = step;
                for (let i = 0; i < saveProgresses.length; i++) {
                    saveProgresses[i].style.innerText = `${progressStep}`;
                } 
                for (let i = 0; i < saveWidgetCons.length; i++) {
                    saveWidgetCons[i].style.display = "none";
                }
                for (let i = 0; i < saveWidgets.length; i++) {
                    saveWidgets[i].style.display = "none";
                }
            });
        }
    }, false);
}

async function compressToZip() {
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add(customFilename + ".pdf", new Uint8ArrayReader(pdfState.existingPDFBytes));
    return zipWriter.close();
}

function downloadPDF(blob) {
    const pdfObjURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.classList.add("ziplink");
    link.href = pdfObjURL;
    link.download = customFilename + ".zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (elemsAdded) {
        if (zipSaveCnt === 1) {
            return Promise.resolve(5);
        } else if (zipSaveCnt === 2) {
            return Promise.resolve(6);
        }
    } else {
        if (zipSaveCnt === 1) {
            return Promise.resolve(1);
        } else if (zipSaveCnt === 2) {
            return Promise.resolve(2);
        }
    }
}

function canvasToImage() {
    const editImgs = document.getElementsByClassName("editimg");
    for (let j = 0; j < editImgs.length; j++) {
        const editImg = editImgs[j];
        const dataURL = editImg.toDataURL("image/png", 1.0);
        const splittedDataURL = dataURL.split(",", 2);
        outputPDF.embedPng(splittedDataURL[1]).then(function(pngImage) {
            const thisPage = parseInt(editImg.getAttribute("data-page"), 10);
            outputPDF.getPages()[thisPage-1].drawImage(pngImage, {
                x: 0,
                y: 0,
                width: pdfState.originalWidths[thisPage-1],
                height: pdfState.originalHeights[thisPage-1]
            });
        });
    }
    return Promise.resolve(3);
}

function zoomForSave() {
    return new Promise((resolve, reject) => {
        pageCounter = 1;
        placeEditorElements();
        renderPage(pageCounter, false);
        setTimeout(() => {
            if (zoomForSaveCnt === 1) {
                resolve(2);
            } else if (zoomForSaveCnt === 2) {
                resolve(7);
            }
        }, 300);
    });
}


function restrictInputValues(inputId, min, max, parseIntOperation, parseFloatOperation) {
    const inputElem = document.getElementById(inputId);
    let valToRestrict;
    inputElem.onchange = null;
    inputElem.onchange = function() {
        valToRestrict = inputElem.value;

        // remove white space
        valToRestrict = valToRestrict.replace(/\s+/g,'');
        document.getElementById(inputId).value = valToRestrict;
        if (valToRestrict.match(/^-?\d+$/) || valToRestrict.match(/^\d+\.\d+$/)) {
            if (parseIntOperation) {
                valToRestrict = parseInt(valToRestrict, 10);
                document.getElementById(inputId).value = valToRestrict;
            } 
            if (parseFloatOperation) {
                valToRestrict = parseFloat(valToRestrict);
            }
            if (valToRestrict >= min && valToRestrict <= max) {
                document.getElementById(inputId).value = valToRestrict;
            } else {
                if (valToRestrict < min) {
                    document.getElementById(inputId).value = min;
                } else if (valToRestrict > max) {
                    document.getElementById(inputId).value = max;
                }
            }
        }
    }
}

function convertInputToSucess(input, min, max, parseIntOperation, parseFloatOperation) {
    let outputVal = input;

    // valid positive/negative integer or valid float
    if (outputVal.match(/^-?\d+$/) || outputVal.match(/^\d+\.\d+$/)) {
        if (parseIntOperation) {
            outputVal = parseInt(outputVal, 10);
        } 
        if (parseFloatOperation) {
            outputVal = parseFloat(outputVal);
        }
        if (outputVal < min || outputVal > max) {
            outputVal = -1000;
        } 
    } else {
        outputVal = -1000;
    }
    return outputVal;
}

function convertZoomInputToSucess(desiredZoom, min, max) {
    let zoomVal = "";
    let hasPercent = false;
    if (desiredZoom.charAt(desiredZoom.length - 1) === '%') {
        zoomVal = desiredZoom.substring(0, desiredZoom.length - 1);   
        hasPercent = true;  
    } else {
        zoomVal = desiredZoom;
    }
    
    if (zoomVal.match(/^-?\d+$/) || zoomVal.match(/^\d+\.\d+$/)) {
        zoomVal = parseInt(zoomVal, 10);
        if (!hasPercent) {
            if (zoomVal < min || zoomVal > max) {
                zoomVal = -1000;
            } 
        } else {
            if (zoomVal < min) {
                zoomVal = min;
            } 
            if (zoomVal > max) {
                zoomVal = max;
            }
        }
    } else {
        zoomVal = -1000;
    }
    return zoomVal;
}

function convertPageListToSucess(inputId, numOfPages) {
    let outputPageList = [];
    let input = document.getElementsByClassName(inputId)[0].value;
    if (input.indexOf(',') > -1) {
        const pages = input.split(",");
        for (let i = 0; i < pages.length; i++) {
            let singlePage = pages[i];

            // Remove white space
            singlePage = singlePage.replace(/\s+/g,'');
            
            // Check if page is an Integer
            if (singlePage.match(/^-?\d+$/)) {
                singlePage = parseInt(singlePage, 10);
                if (singlePage >= 1 && singlePage <= numOfPages) {
                    outputPageList.push(singlePage);
                } else {
                    outputPageList = [];
                    break;
                }
            } else {
                outputPageList = [];
                break;
            }
        }
    } else {
        let singlePage = input.replace(/\s+/g,'');
        if (singlePage.match(/^-?\d+$/)) {
            singlePage = parseInt(singlePage, 10);
            if (singlePage >= 1 && singlePage <= numOfPages) {
                outputPageList.push(singlePage);
            } else {
                outputPageList = [];
            }
        } else {
            outputPageList = [];
        }
    }
    if (outputPageList.length > 0) {
            
        // remove dublicates in list
        outputPageList = outputPageList.filter((value, index) => outputPageList.indexOf(value) === index);

        // sort in ascending order
        outputPageList.sort((a,b) => a-b);  
    }
    if (outputPageList.length === 0) {
        document.getElementsByClassName(inputId)[0].value = "";
    } else {
        let listString = "";
        for (let i = 0; i < outputPageList.length; i++) {
            let outputPageListElem = outputPageList[i];
            if (i < outputPageList.length - 1) {
                listString = listString + outputPageListElem + ",";
            } else {
                listString = listString + outputPageListElem;
            }
        }
        document.getElementsByClassName(inputId)[0].value = listString;
    }
    return outputPageList;
}