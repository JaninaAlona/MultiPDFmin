const { BlobWriter, Uint8ArrayReader, ZipWriter } = zip


async function compressToZip(pdfBytes, filename) {
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add(filename + ".pdf", new Uint8ArrayReader(pdfBytes));
    return zipWriter.close();
}

function downloadPDF(blob, filename) {
    const pdfObjURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.classList.add("ziplink");
    link.href = pdfObjURL;
    link.download = filename + ".zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return Promise.resolve("PDF downloaded");
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