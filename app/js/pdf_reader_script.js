let pdfState = {
    pdf: null,
    currentPage: 1,
    zoom: 1,
    originalPDFBytes: null,
    existingPDFBytes: null,
    savedPDFBytes: null
}

let pageCounter = 1;
let customFilename;
let file;
let pdfFileName;
let pdfPath;
let isDrawing = false;
let isErasing = false;
let draggingMode = false;
let mouseIsDown = false;
let originalWidth;
let originalHeight;
let userModes = [];
let userModesDrawer = [];
let userModesGeometry = [];
let userModesImages = [];
let writeLayerStack = [];
let userTextList = [];
let userImageList = [];
let geometryPointsList = [];
let drawLayerStack = [];
let imagesBase64Strings = [];
let fontBytes = [];
let outputPDF;
let fileLoaded = false;
let sidemenuVisible = true;
let layersVisible = true;
let onetimeSetup = true;
let displayEditControls;
let writePdfBtn;
let drawPdfBtn;
let geometryBtn;
let imagesBtn;


let inputFileButtons = document.getElementsByClassName('inputfile');
for (let i = 0; i < inputFileButtons.length; i++) {
    inputFileButtons[i].addEventListener("change", function(e) {
        resetAllModes();
        cleanUp();
        file = e.target.files[0];
        const fileReader = new FileReader(); 
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            pdfState.originalPDFBytes = typedarray;
            const loadingTask = pdfjsLib.getDocument(typedarray);
            loadingTask.promise.then(async (pdf) => {
                await kickOff(pdf);
                document.getElementById('maxPDFPages').innerHTML = pdf._pdfInfo.numPages + " pages";
                restrictInputValues('current_page', 1, pdf._pdfInfo.numPages, false, false);
                updateCursorX();
                updateCursorY();
            });
            document.getElementById("viewer_bg").style.display = "flex";
            restrictInputValues('zoom_factor', 1, 800, true, false);
            setCustomFilename();
        }
        if (file) {
            fileReader.readAsArrayBuffer(file);
            fileLoaded = true;
        }
        pdfFileName = file.name;
    }, false);
}

function cleanUp() {
    try {
        let pdf = pdfState.pdf;
    } catch (e) {
        if (e instanceof TypeError) {} else {
            pdfState.pdf = null;
        }
    } finally {
        pdfState.zoom = 1.0;
        resetRendering();
    }
}

function resetRendering() {
    let pdfViewers = document.getElementsByClassName('pdf_viewer');
    for (let i = 0; i < pdfViewers.length; i++) {
        while (pdfViewers[i].firstChild) {
            pdfViewers[i].removeChild(pdfViewers[i].lastChild);
        }
    }
    writeLayerStack = [];
    userTextList = [];
    userImageList = [];
    drawLayerStack = [];
    geometryPointsList = [];
    userModes = [];
    userModesDrawer = [];
    userModesGeometry = [];
    userModesImages = [];
    fontBytes = [];
    imagesBase64Strings = [];
    pageCounter = 1;
}

async function kickOff(pdf) {
    resetToDefaults();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfState.originalPDFBytes);
    const pdfBytes = await pdfDoc.save();
    pdfState.originalPDFBytes = pdfBytes;
    pdfState.existingPDFBytes = pdfState.originalPDFBytes;
    pdfState.pdf = pdf;
    adjustPDFToUserViewport(pdfDoc);
    await pdfState.pdf.getPage(1).then(renderAllPages);
}


function jumpTo(pageToJump) {
    let jumpAnchor = 0;
    if (pdfState.currentPage == 1) {
        const scrollwrappers = document.getElementsByClassName('scrollwrapper');
        for(let i = 0; i < scrollwrappers.length; i++) {
            scrollwrappers[i].scrollTo(0, 0);
        }
    } else {
        for (let i = 0; i < pageToJump - 1; i++) {
            let canvasElems = document.getElementsByClassName('render_context');
            jumpAnchor += canvasElems[i].height + 20;
        }
        pdfState.currentPage = pageToJump;
        let scrollwrappers = document.getElementsByClassName('scrollwrapper');
        for (let i = 0; i < scrollwrappers.length; i++)
            scrollwrappers[i].scrollTo(0, jumpAnchor, { behavior: "smooth" });
     }
}

function goPrevPage(e) {
    resetAllModes();
    e.preventDefault;
    if (pdfState.currentPage == 1) {
        pdfState.currentPage = 1;
        document.getElementById('current_page').value = 1;
    } else {
        pdfState.currentPage -= 1;
        document.getElementById("current_page").value = pdfState.currentPage;
        jumpTo(pdfState.currentPage);
    }
}

function goNextPage(e) {
    resetAllModes();
    e.preventDefault;
    if (pdfState.currentPage >= pdfState.pdf._pdfInfo.numPages) {
        pdfState.currentPage = pdfState.pdf._pdfInfo.numPages;
        document.getElementById('current_page').value = pdfState.pdf._pdfInfo.numPages;
    } else {
        pdfState.currentPage += 1;
        document.getElementById("current_page").value = pdfState.currentPage;
        jumpTo(pdfState.currentPage);
    }
}

function enterPageNum(e) {
    resetAllModes();
    e.preventDefault;
    if (e.key == 'Enter') {
        let desiredPage = document.getElementById('current_page').value;
        while (desiredPage.search(" ") > -1) {
            desiredPage = desiredPage.replace(" ", "");
        }
        if (!isNaN(desiredPage)) {
            desiredPage = Number(desiredPage);
            if (Number.isInteger(desiredPage) && desiredPage >= 1 && desiredPage <= pdfState.pdf._pdfInfo.numPages) {
                pdfState.currentPage = desiredPage;
                document.getElementById("current_page").value = pdfState.currentPage;
                jumpTo(desiredPage);
            }
        }
    }
}

function displayPageNum(e) {
    let scrollDistance = e.target.scrollTop; 
    let scrolledPageHeight = 0;
    let displayedPage = 0;
    let canvasElems = document.getElementsByClassName('render_context');
    for (let i = 0; i < pdfState.pdf._pdfInfo.numPages; i++) {
        if (scrolledPageHeight <= scrollDistance) {
            scrolledPageHeight += canvasElems[i].height;
            displayedPage++; 
        } else {
            break;
        }
    }
    document.getElementById("current_page").value = displayedPage;
    pdfState.currentPage = displayedPage;
}

async function renderAllPages(page) {
    let viewport = page.getViewport({
        scale: pdfState.zoom
    });
    let canvas;
    let pdfViewers = document.getElementsByClassName('pdf_viewer');
    for (let i = 0; i < pdfViewers.length; i++) {
        pdfViewers[i].width = viewport.width;
        if (writeLayerStack.length < pdfState.pdf._pdfInfo.numPages) {
            let div = document.createElement("div");
            div.style.display = "flex";
            div.width = viewport.width;
            div.height = viewport.height;
            div.style.marginBottom = "20px";
            originalWidth = viewport.width;
            originalHeight = viewport.height;
            div.setAttribute('data-write', pageCounter);
            div.setAttribute("data-rotation", 0);
            div.classList.add("write_layer");
            canvas = document.createElement("canvas");
            canvas.style.display = "flex";
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.setAttribute('data-page', pageCounter);
            canvas.classList.add("render_context");
            div.appendChild(canvas);
            pdfViewers[i].appendChild(div);
            writeLayerStack.push(div);
        } else if (writeLayerStack.length == pdfState.pdf._pdfInfo.numPages) {
            let div = writeLayerStack[pageCounter-1];
            div.width = viewport.width;
            div.height = viewport.height;
            canvas = writeLayerStack[pageCounter-1].childNodes[0];
            canvas.width = viewport.width;
            canvas.height = viewport.height;
        }
    }
    
    const context = canvas.getContext('2d');
    page.render({
        canvasContext: context,
        viewport: viewport
    });
    pageCounter++;
    if (pdfState.pdf != null && pageCounter <= pdfState.pdf._pdfInfo.numPages) {
        await pdfState.pdf.getPage(pageCounter).then(renderAllPages);
    }
}

async function renderPage(page) {
    let viewport = page.getViewport({
        scale: pdfState.zoom
    });
    let currentPage = document.getElementById("current_page").value;
    currentPage = parseInt(currentPage);
    let div = writeLayerStack[currentPage-1];
    div.width = viewport.width;
    div.height = viewport.height;
    let canvas = writeLayerStack[currentPage-1].childNodes[0];
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    page.render({
        canvasContext: context,
        viewport: viewport
    });
}


function adjustPDFToUserViewport(pdfDoc) {
    const vW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const firstPage = pdfDoc.getPages()[0];
    let width = firstPage.getWidth();
    let newVWidth = vW - 200;
    if (width > newVWidth) {
        let widthToLargeFactor = width / newVWidth;
        pdfState.zoom = Math.pow(widthToLargeFactor, -1);
    } else {
        pdfState.zoom = 1.0;
    }
    document.getElementById("zoom_factor").value = toPercent(pdfState.zoom) + "%";
}


async function zoomIn(e) {
    resetAllModes();
    e.preventDefault;
    if (pdfState.zoom <= 8.0) {
        let percent = toPercent(pdfState.zoom);
        percent += 20;
        if (percent <= 800) {
            document.getElementById('zoom_factor').value = percent + "%";
            pdfState.zoom = toFactor(percent);
            placeEditorElements();
            pageCounter = 1;
            await pdfState.pdf.getPage(1).then(renderAllPages);
        }
    }
}


async function zoomOut(e) {
    resetAllModes();
    e.preventDefault;
    if (pdfState.zoom >= 0.1) {
        let percent = toPercent(pdfState.zoom);
        percent -= 20;
        if (percent >= 10) {
            document.getElementById('zoom_factor').value = percent + "%";
            pdfState.zoom = toFactor(percent);
            placeEditorElements();
            pageCounter = 1;
            await pdfState.pdf.getPage(1).then(renderAllPages);
        }
    }
}


async function enterZoomFactor(e) {
    resetAllModes();
    e.preventDefault;
    let triggerZoom = false;
    if (e.key == 'Enter') {
        let desiredZoom = document.getElementById('zoom_factor').value;
        while (desiredZoom.search(" ") > -1) {
            desiredZoom = desiredZoom.replace(" ", "");
        }
        let zoomVal = 0;
        if (desiredZoom.charAt(desiredZoom.length - 1) === '%') {
            zoomVal = desiredZoom.substring(0, desiredZoom.length - 1);     
        } else {
            zoomVal = desiredZoom;
        }
        if (!isNaN(zoomVal)) {
            zoomVal = parseInt(zoomVal);      
            triggerZoom = true;   
        } else {
            triggerZoom = false;
        }
        if (triggerZoom && zoomVal >= 1 && zoomVal <= 800) {
            pdfState.zoom = toFactor(zoomVal);
            document.getElementById("zoom_factor").value = zoomVal + "%";
            placeEditorElements();
            pageCounter = 1;
            await pdfState.pdf.getPage(1).then(renderAllPages);
        }
    }
}

function placeEditorElements() {
    if (userTextList.length > 0) {
        for(let i = 0; i < userTextList.length; i++) {
            let controllerPoint = userTextList[i];
            let leftVal = controllerPoint.x * pdfState.zoom;
            let topVal = controllerPoint.y * pdfState.zoom;
            controllerPoint.controlBox.style.left = leftVal + "px";
            controllerPoint.controlBox.style.top = topVal + "px";
            zoomText(controllerPoint);
        }
    }
    if (userImageList.length > 0) {
        for(let i = 0; i < userImageList.length; i++) {
            let controllerPoint = userImageList[i];
            let leftVal = controllerPoint.x * pdfState.zoom;
            let topVal = controllerPoint.y * pdfState.zoom;
            controllerPoint.controlBox.style.left = leftVal + "px";
            controllerPoint.controlBox.style.top = topVal + "px";
            zoomImages(controllerPoint);
        }
    }
    if (drawLayerStack.length > 0) {
        for(let i = 0; i < drawLayerStack.length; i++) {
            let controllerPoint = drawLayerStack[i];
            let leftVal = controllerPoint.x * pdfState.zoom;
            let topVal = controllerPoint.y * pdfState.zoom;
            controllerPoint.controlBox.style.left = leftVal + "px";
            controllerPoint.controlBox.style.top = topVal + "px";
            zoomDrawing(controllerPoint, pdfState.zoom, pdfState.zoom);
            rotateDrawing(controllerPoint, controllerPoint.elementToControl.rotation);
        }
    }
    if (geometryPointsList.length > 0) {
        for(let i = 0; i < geometryPointsList.length; i++) {
            let controllerPoint = geometryPointsList[i];
            controllerPoint.originX = 0;
            controllerPoint.originY = 0;
            controllerPoint.rotateControlPoint();
            let shapeCenterDistanceX = (controllerPoint.elementToControl.width/2) * pdfState.zoom;
            let shapeCenterDistanceY = (controllerPoint.elementToControl.height/2) * pdfState.zoom;
            let shapeCenterX;
            let shapeCenterY;
            let leftVal;
            let topVal;
            if (controllerPoint.elementToControl.type === "rectangle" || controllerPoint.elementToControl.type === "triangle") {
                shapeCenterX = controllerPoint.elementToControl.x * pdfState.zoom + shapeCenterDistanceX;
                shapeCenterY = controllerPoint.elementToControl.y * pdfState.zoom + shapeCenterDistanceY;   
            } else if (controllerPoint.elementToControl.type === "circle") {
                shapeCenterX = controllerPoint.elementToControl.x * pdfState.zoom;
                shapeCenterY = controllerPoint.elementToControl.y * pdfState.zoom;
            }
            leftVal = shapeCenterX - 20;
            topVal = shapeCenterY - 20;
            controllerPoint.controlBox.style.left = leftVal + "px";
            controllerPoint.controlBox.style.top = topVal + "px";
            zoomGeometry(controllerPoint);
        }
    }
}

async function zoomText(controlP) {
    controlP.editImg.width = originalWidth * pdfState.zoom;
    controlP.editImg.height = originalHeight * pdfState.zoom;
    const currentText = controlP.elementToControl;
    await updateUserLayer(controlP, currentText.pdfBytes); 
}

async function zoomImages(controlP) {
    controlP.editImg.width = originalWidth * pdfState.zoom;
    controlP.editImg.height = originalHeight * pdfState.zoom;
    const currentImage = controlP.elementToControl;
    await updateUserLayer(controlP, currentImage.pdfBytes);  
}

function zoomGeometry(controlP) {
    let context = controlP.editImg.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);  
    context.save();
    scaleEditImgShapeCanvas(controlP.editImg);
    let currentShape = controlP.elementToControl;
    currentShape.drawShape();
    context.restore();
}

function scaleEditImgShapeCanvas(editImg) {
    editImg.width = originalWidth * pdfState.zoom;
    editImg.height = originalHeight * pdfState.zoom;
    let ctx = editImg.getContext("2d");
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;
    ctx.translate(width, height);
    ctx.scale(pdfState.zoom, pdfState.zoom);
    ctx.translate(-width/pdfState.zoom, -height/pdfState.zoom); 
}

function resetToDefaults() {
    onetimeSetup = true;
    document.getElementById("current_page").value = 1;
    let pdfViewers = document.getElementsByClassName("pdf_viewer")
    for (let i = 0; i < pdfViewers.length; i++) {
        pdfViewers[i].style.display = "flex";
    }
    document.getElementById("reader_controls").style.display = "flex";
}

function toPercent(factor) {
    let percentString = Number(factor).toLocaleString("en-GB", { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
    let outputPercent = percentString.substring(0, percentString.length-2);
    let percentInt = parseInt(outputPercent);
    return percentInt;
}

function toFactor(percentage) {
    let factorString = Number(percentage/100).toLocaleString("en-GB", { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
    let factorFloat = parseFloat(factorString);
    return factorFloat;
}


document.getElementById('go_previous').addEventListener('click', goPrevPage, false);
document.getElementById('go_next').addEventListener('click', goNextPage, false);
document.getElementById('current_page').addEventListener('keyup', enterPageNum, false);

let scrollwrappers = document.getElementsByClassName("scrollwrapper");
for (let i = 0; i < scrollwrappers.length; i++) {
    scrollwrappers[i].onscroll = displayPageNum;
}

document.getElementById('zoom_in').addEventListener('click', zoomIn, false);
document.getElementById('zoom_factor').addEventListener('keypress', enterZoomFactor, false);
document.getElementById('zoom_out').addEventListener('click', zoomOut, false);


document.getElementById("dragpdf").addEventListener("click", function() {
    resetAllModes();
    draggingMode = true;
    const writeLayers = document.getElementsByClassName("write_layer");
    for (let i = 0; i < writeLayers.length; i++) {
        writeLayers[i].onmousedown = null;
    }
    let pdfViewerCons = document.getElementsByClassName("pdf_viewer_con");
    for (let i = 0; i < pdfViewerCons.length; i++) {
        dragElement(pdfViewerCons[i]);
    }
}, false);


function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let currentPage = document.getElementById("current_page").value;
    currentPage = parseInt(currentPage);
    const writeLayers = document.getElementsByClassName("write_layer");
    let currentWriteLayer;
    for (let i = 0; i < writeLayers.length; i++) {
        if (parseInt(writeLayers[i].getAttribute("data-write")) === currentPage) {
            currentWriteLayer = writeLayers[i];
        }
    }
    currentWriteLayer.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (draggingMode) {
            mouseIsDown = true;
            for (let i = 0; i < writeLayerStack.length; i++) {
                writeLayerStack[i].style.cursor = "move";
            }
            pos3 = e.clientX;
            pos4 = e.clientY;
            currentWriteLayer.onmouseup = closeDragElement;
            currentWriteLayer.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        if (draggingMode && mouseIsDown) {
            mouseIsDown = true;
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        }
    }

    function closeDragElement() {
        if (draggingMode) {
            mouseIsDown = false;
            for (let i = 0; i < writeLayerStack.length; i++) {
                writeLayerStack[i].style.cursor = "default";
            }
            currentWriteLayer.onmouseup = null;
            currentWriteLayer.onmousemove = null;
        }
    }
}


if (document.getElementById('spin_right') !== undefined && document.getElementById('spin_right') !== null) {
    document.getElementById("spin_right").addEventListener("click", async function() {
        resetAllModes();
        let currentPage = document.getElementById("current_page").value;
        while (currentPage.search(" ") > -1) {
            currentPage = currentPage.replace(" ", "");
        }
        if (!isNaN(currentPage)) {
            currentPage = Number(currentPage);
            if (Number.isInteger(currentPage) && currentPage >= 1 && currentPage <= pdfState.pdf._pdfInfo.numPages) {
                currentPage = parseInt(currentPage);
                const pdfDoc = await PDFLib.PDFDocument.load(pdfState.existingPDFBytes);
                let currentRotation = pdfDoc.getPages()[currentPage-1].getRotation().angle;
                let newRotation = currentRotation + 90;
                if (newRotation === 360) {
                    newRotation = 0;
                }
                await setPageRotation(pdfDoc, currentPage, newRotation);
            }
        }
    }, false);
}

if (document.getElementById('spin_left') !== undefined && document.getElementById('spin_left') !== null) {
    document.getElementById("spin_left").addEventListener("click", async function() {
        resetAllModes();
        let currentPage = document.getElementById("current_page").value;
        while (currentPage.search(" ") > -1) {
            currentPage = currentPage.replace(" ", "");
        }
        if (!isNaN(currentPage)) {
            currentPage = Number(currentPage);
            if (Number.isInteger(currentPage) && currentPage >= 1 && currentPage <= pdfState.pdf._pdfInfo.numPages) {
                currentPage = parseInt(currentPage);
                const pdfDoc = await PDFLib.PDFDocument.load(pdfState.existingPDFBytes);
                let currentRotation = pdfDoc.getPages()[currentPage-1].getRotation().angle;
                let newRotation = currentRotation - 90;
                if (newRotation === -360) {
                    newRotation = 0;
                }
                await setPageRotation(pdfDoc, currentPage, newRotation);
            }
        }
    }, false);
}

async function setPageRotation(pdfDoc, currentPage, newRotation) {
    pdfDoc.getPages()[currentPage-1].setRotation(PDFLib.degrees(newRotation));
    pdfState.existingPDFBytes = await pdfDoc.save();
    pdfState.originalPDFBytes = pdfState.existingPDFBytes;
    const loadingTask = pdfjsLib.getDocument(pdfState.existingPDFBytes);
    loadingTask.promise.then(pdf => {
        pdfState.pdf = pdf;
        pdfState.pdf.getPage(currentPage).then(renderPage);
    }); 
    let writeLayers = document.getElementsByClassName("write_layer");
    let renderContextes = document.getElementsByClassName("render_context");
    let newWidth = writeLayers[currentPage-1].height;
    let newHeight = writeLayers[currentPage-1].width;
    writeLayers[currentPage-1].width = newWidth;
    writeLayers[currentPage-1].height = newHeight;
    writeLayers[currentPage-1].setAttribute("data-rotation", newRotation);
    originalWidth = newWidth;
    originalHeight = newHeight;
    renderContextes[currentPage-1].width = newWidth;
    renderContextes[currentPage-1].height = newHeight;
}


function restrictInputValues(inputId, min, max, parseIntOperation, parseFloatOperation) {
    const inputElem = document.getElementById(inputId);
    let valToRestrict;
    inputElem.addEventListener('change', function() {
        valToRestrict = inputElem.value;
        while (valToRestrict.search(" ") > -1) {
            valToRestrict = valToRestrict.replace(" ", "");
        }
        if (!isNaN(valToRestrict)) {
            if (parseIntOperation || parseFloatOperation) {  
                if (parseIntOperation) {
                    valToRestrict = parseInt(valToRestrict);
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
            } else {
                valToRestrict = Number(valToRestrict);
                if (Number.isInteger(valToRestrict)) {
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
    }, false);
}


function resetUserModes() {
    if (userModes.length > 0) {
        for (let i = 0; i < userModes.length; i++) {
            userModes[i] = false;
        } 
    }
}

function resetUserModesDrawer() {
    if (userModesDrawer.length > 0) {
        for (let i = 0; i < userModesDrawer.length; i++) {
            userModesDrawer[i] = false;
        }
    }
}

function resetUserModesGeometry() {
    if (userModesGeometry.length > 0) {
        for (let i = 0; i < userModesGeometry.length; i++) {
            userModesGeometry[i] = false;
        }
    }
}

function resetUserModesImages() {
    if (userModesImages.length > 0) {
        for (let i = 0; i < userModesImages.length; i++) {
            userModesImages[i] = false;
        }
    }
}

function resetAllModes() {
    resetUserModes();
    resetUserModesDrawer();
    resetUserModesGeometry();
    resetUserModesImages();
    draggingMode = false;
    relocateLayersMode = false;
    isDrawing = false;
    isErasing = false;
    mouseIsDown = false;
    clicked = false;
    short = false;
}


function setCustomFilename() {
    const customFilenames = document.getElementsByClassName("custom_filename");
    customFilename = pdfFileName.slice(0, pdfFileName.length - 4) + "_edited";
    for (let i = 0; i < customFilenames.length; i++) {
        customFilenames[i].value = customFilename;
        customFilenames[i].addEventListener("input", function() {
            let inputFilename = customFilenames[i].value;
            if (inputFilename.length > 50) {
                inputFilename = inputFilename.substring(0, 50);
                customFilenames[i].value = inputFilename;
            }
            customFilename = inputFilename;
        }, false);
    }
}

const saveButtonsEditor = document.getElementsByClassName('save_pdf_editor');
for (let i = 0; i < saveButtonsEditor.length; i++) {
    saveButtonsEditor[i].addEventListener("click", async function(e) {
        resetAllModes();  
        outputPDF = await PDFLib.PDFDocument.load(pdfState.originalPDFBytes);
        for (let i = 0; i < writeLayerStack.length; i++) {
            const writeLayer = writeLayerStack[i];
            const editImgs = writeLayer.getElementsByClassName("editimg");
            if (editImgs.length > 0) {
                for (let j = 0; j < editImgs.length; j++) {
                    const editImg = editImgs[j];
                    canvasToImage(editImg);
                }
            }
        }
        pdfState.existingPDFBytes = await outputPDF.save();
        download(pdfState.existingPDFBytes, customFilename + ".pdf", "application/pdf");
    }, false);
}

async function canvasToImage(editImg) {
    const dataURL = editImg.toDataURL("image/png", 1.0);
    const splittedDataURL = dataURL.split(",", 2);
    let pngImage = await outputPDF.embedPng(splittedDataURL[1]);
    let thisPage = parseInt(editImg.getAttribute("data-page"));
    outputPDF.getPages()[thisPage-1].drawImage(pngImage, {
        x: 0,
        y: 0,
        width: originalWidth,
        height: originalHeight
    });
}


if (document.getElementsByClassName("display_edit_ctls")[0] !== undefined && document.getElementsByClassName("display_edit_ctls")[0] !== null) {
    displayEditControls = document.getElementsByClassName("display_edit_ctls")[0];
    displayEditControls.addEventListener("change", initEditor, false);
}

if (document.getElementById("writepdfbtn") !== undefined && document.getElementById("writepdfbtn") !== null) {
    writePdfBtn = document.getElementById("writepdfbtn");
    writePdfBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightTextButton();
        if (fileLoaded) {
            document.getElementById('writer_controls').style.display = "flex";
            document.getElementById('editor_controls').style.display = "flex";
            document.getElementById('drawer_controls').style.display = "none";
            document.getElementById('pencil_controls').style.display = "none";
            document.getElementById('geometry_controls').style.display = "none";
            document.getElementById('shape_controls').style.display = "none";
            document.getElementById('images_controls').style.display = "none";
            document.getElementById('img_controls').style.display = "none";
        }
    }, false);
}

if (document.getElementById("drawpdfbtn") !== undefined && document.getElementById("drawpdfbtn") !== null) {
    drawPdfBtn = document.getElementById("drawpdfbtn");
    drawPdfBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightDrawButton();
        if (fileLoaded) {
            document.getElementById('drawer_controls').style.display = "flex";
            document.getElementById('pencil_controls').style.display = "flex";
            document.getElementById('writer_controls').style.display = "none";
            document.getElementById('editor_controls').style.display = "none";
            document.getElementById('geometry_controls').style.display = "none";
            document.getElementById('shape_controls').style.display = "none";
            document.getElementById('images_controls').style.display = "none";
            document.getElementById('img_controls').style.display = "none";
        }
    }, false);
}

if (document.getElementById("geometrybtn") !== undefined && document.getElementById("geometrybtn") !== null) {
    geometryBtn = document.getElementById("geometrybtn");
    geometryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightShapeButton();
        if (fileLoaded) {
            document.getElementById('writer_controls').style.display = "none";
            document.getElementById('editor_controls').style.display = "none";
            document.getElementById('drawer_controls').style.display = "none";
            document.getElementById('pencil_controls').style.display = "none";
            document.getElementById('geometry_controls').style.display = "flex";
            document.getElementById('shape_controls').style.display = "flex";
            document.getElementById('images_controls').style.display = "none";
            document.getElementById('img_controls').style.display = "none";
        }
    }, false);
}

if (document.getElementById("imagesbtn") !== undefined && document.getElementById("imagesbtn") !== null) {
    imagesBtn = document.getElementById("imagesbtn");
    imagesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightImageButton();
        if (fileLoaded) {
            document.getElementById('writer_controls').style.display = "none";
            document.getElementById('editor_controls').style.display = "none";
            document.getElementById('drawer_controls').style.display = "none";
            document.getElementById('pencil_controls').style.display = "none";
            document.getElementById('geometry_controls').style.display = "none";
            document.getElementById('shape_controls').style.display = "none";
            document.getElementById('images_controls').style.display = "flex";
            document.getElementById('img_controls').style.display = "flex";
        }
    }, false);
}

function highlightTextButton() {
    writePdfBtn.classList.remove("btn-success");
    writePdfBtn.classList.add("btn-outline-success");
    drawPdfBtn.classList.remove("btn-outline-success");
    drawPdfBtn.classList.add("btn-success");
    geometryBtn.classList.remove("btn-outline-success");
    geometryBtn.classList.add("btn-success");
    imagesBtn.classList.remove("btn-outline-success");
    imagesBtn.classList.add("btn-success");
    displayEditControls.setAttribute("data-mode", "edit_text");
}

function highlightDrawButton() {
    writePdfBtn.classList.remove("btn-outline-success");
    writePdfBtn.classList.add("btn-success");
    drawPdfBtn.classList.remove("btn-success");
    drawPdfBtn.classList.add("btn-outline-success");
    geometryBtn.classList.remove("btn-outline-success");
    geometryBtn.classList.add("btn-success");
    imagesBtn.classList.remove("btn-outline-success");
    imagesBtn.classList.add("btn-success");
    displayEditControls.setAttribute("data-mode", "edit_draw");
}

function highlightShapeButton() {
    writePdfBtn.classList.remove("btn-outline-success");
    writePdfBtn.classList.add("btn-success");
    drawPdfBtn.classList.remove("btn-outline-success");
    drawPdfBtn.classList.add("btn-success");
    geometryBtn.classList.remove("btn-success");
    geometryBtn.classList.add("btn-outline-success");
    imagesBtn.classList.remove("btn-outline-success");
    imagesBtn.classList.add("btn-success");
    displayEditControls.setAttribute("data-mode", "edit_shape");
}

function highlightImageButton() {
    writePdfBtn.classList.remove("btn-outline-success");
    writePdfBtn.classList.add("btn-success");
    drawPdfBtn.classList.remove("btn-outline-success");
    drawPdfBtn.classList.add("btn-success");
    geometryBtn.classList.remove("btn-outline-success");
    geometryBtn.classList.add("btn-success");
    imagesBtn.classList.remove("btn-success");
    imagesBtn.classList.add("btn-outline-success");
    displayEditControls.setAttribute("data-mode", "edit_image");
}


function initEditor() {
    if (fileLoaded && displayEditControls.getAttribute("data-mode") === "edit_text") {
        document.getElementById('sidemenu').style.display = "flex";
        document.getElementById('layer_stack').style.display = "flex";
        document.getElementById('writer_controls').style.display = "flex";
        document.getElementById('editor_controls').style.display = "flex";
        document.getElementById('drawer_controls').style.display = "none";
        document.getElementById('pencil_controls').style.display = "none";
        document.getElementById('geometry_controls').style.display = "none";
        document.getElementById('shape_controls').style.display = "none";
        document.getElementById('images_controls').style.display = "none";
        document.getElementById('img_controls').style.display = "none";  
        
    }
    if (fileLoaded && displayEditControls.getAttribute("data-mode") === "edit_draw") {
        document.getElementById('sidemenu').style.display = "flex";
        document.getElementById('layer_stack').style.display = "flex";
        document.getElementById('drawer_controls').style.display = "flex";
        document.getElementById('pencil_controls').style.display = "flex";
        document.getElementById('writer_controls').style.display = "none";
        document.getElementById('editor_controls').style.display = "none";
        document.getElementById('geometry_controls').style.display = "none";
        document.getElementById('shape_controls').style.display = "none";
        document.getElementById('images_controls').style.display = "none";
        document.getElementById('img_controls').style.display = "none";
    }
    if (fileLoaded && displayEditControls.getAttribute("data-mode") === "edit_shape") {
        document.getElementById('sidemenu').style.display = "flex";
        document.getElementById('layer_stack').style.display = "flex";
        document.getElementById('writer_controls').style.display = "none";
        document.getElementById('editor_controls').style.display = "none";
        document.getElementById('drawer_controls').style.display = "none";
        document.getElementById('pencil_controls').style.display = "none";
        document.getElementById('geometry_controls').style.display = "flex";
        document.getElementById('shape_controls').style.display = "flex";
        document.getElementById('images_controls').style.display = "none";
        document.getElementById('img_controls').style.display = "none";
    }
    if (fileLoaded && displayEditControls.getAttribute("data-mode") === "edit_image") {
        document.getElementById('sidemenu').style.display = "flex";
        document.getElementById('layer_stack').style.display = "flex";
        document.getElementById('writer_controls').style.display = "none";
        document.getElementById('editor_controls').style.display = "none";
        document.getElementById('drawer_controls').style.display = "none";
        document.getElementById('pencil_controls').style.display = "none";
        document.getElementById('geometry_controls').style.display = "none";
        document.getElementById('shape_controls').style.display = "none";
        document.getElementById('images_controls').style.display = "flex";
        document.getElementById('img_controls').style.display = "flex";
    }
    if (fileLoaded) {
        if (onetimeSetup) {
            onetimeSetup = false;
            sidemenuVisible = true;
            layersVisible = true;
            boxApplyMode = true;
            layerApplyMode = false;
            document.getElementById('show_btns').style.display = "none";
            initLayerVariables();
            initTextEditorControls();
            restrictInputValues('lineheight_input', 1, 200, false, false);
            restrictInputValues('textsize_input', 3, 400, false, false);
            restrictInputValues('textrotation_input', -360, 360, true, false);
            initDrawerEditorControls();
            restrictInputValues('scale_width_draw', 0.1, 20.0, false, true);
            restrictInputValues('scale_height_draw', 0.1, 20.0, false, true);
            restrictInputValues('drawrotation_input', -360, 360, true, false);
            initGeometryEditorControls();
            restrictInputValues('scale_width', 1, 3000, true, false);
            restrictInputValues('scale_height', 1, 3000, true, false);
            restrictInputValues('xp2', 1, 3000, true, false);
            restrictInputValues('yp2', 1, 3000, true, false);
            restrictInputValues('shaperotation_input', -360, 360, true, false);
            initImagesEditorControls();
            restrictInputValues('scale_width_img', 1, 3000, true, false);
            restrictInputValues('scale_height_img', 1, 3000, true, false);
            restrictInputValues('imgrotation_input', -360, 360, true, false); 
        }
    }
}


function initLayerVariables() {
    layerNameCounterText = 1;
    layerNameCounterShape = 1;
    layerNameCounterDrawing = 1;
    layerNameCounterImage = 1;
    copyCounter = 1;
    selectDrawing = false;
    selectImage = false;
    selectShape = false;
    selectText = false;
    unselectDrawing = false;
    unselectImage = false;
    unselectShape = false;
    unselectText = false;
    selectLocked = false;
    selectUnlocked = false;
    unselectLocked = false;
    unselectUnlocked = false;
    relocateLayersMode = false;
    nothingSelected = true;
    selAll.disabled = true;
    unselAll.disabled = true;
    firstStackLayer = true;
    trimmedPages = [];
    untrimmedPages = [];
    let pagelist = document.getElementsByClassName("pagelist")[0];
    pagelist.value = "";
    let unpagelist = document.getElementsByClassName("un_pagelist")[0];
    unpagelist.value = "";
}


function initTextEditorControls() {
    x = 0;
    y = 0;
    radioText = true;
    fontSizeSelectorTriggered = false;
    fontSizeInputFieldTriggered = false;
    rotateTextSelectorTriggered = false;
    rotateTextInputFieldTriggered = false;
    lineheightSelectorTriggered = false;
    lineheightInputFieldTriggered = false;
    textControllerPointCounter = 0;
    initUserModesWriter();
    initSidemenuControlsWriter();
}

function initUserModesWriter() {
    userModes = [];
    let addTextMode = false;
    userModes.push(addTextMode);
    let deleteTextMode = false;
    userModes.push(deleteTextMode);
    let moveTextMode = false;
    userModes.push(moveTextMode);
    let editTextMode = false;
    userModes.push(editTextMode);
    let applyFontMode = false;
    userModes.push(applyFontMode);
    let applyCustomFontMode = false;
    userModes.push(applyCustomFontMode);
    let applyFontSizeMode = false;
    userModes.push(applyFontSizeMode);
    let applyFontColorMode = false;
    userModes.push(applyFontColorMode);
    let applyTextRotationMode = false;
    userModes.push(applyTextRotationMode);
    let applyLineHeightMode = false;
    userModes.push(applyLineHeightMode);
}

function initSidemenuControlsWriter() {
    sidemenuVisible = true;
    textarea.value = "dummy";
    fontSelector.selectedIndex = 8;
    fontSizeSelector.value = "30";
    sizeInput.value = 30;
    textRotationSelector.selectedIndex = 0; 
    textRotationInput.value = 0;
    lineheightSelector.selectedIndex = 2;
    lineheightInput.value = 24;
}


function initDrawerEditorControls() {
    pencilColor = "rgba(0,0,0,1.0)";
    eraserColor = "rgba(0,0,0,1.0)";
    isDrawing = false;
    isErasing = false;
    addLayer = true;
    drawControllerPointCounter = 0;
    initUserModesDrawer();
    initSidemenuControlsDrawer();
}

function initSidemenuControlsDrawer() {
    sidemenuVisible = true;
    scaleInputFieldWidthDraw.value = 1;
    scaleInputFieldHeightDraw.value = 1;
    sliderPencilsize.value = 4;
    sliderPencilsize.wPosition = 4;
    outputPencilsize.value = "4";
    drawRotationSelector.selectedIndex = 0;
    drawRotationInput.value = 0;
}

function initUserModesDrawer() {
    userModesDrawer = [];
    let drawingMode = false;
    userModesDrawer.push(drawingMode);
    let eraserMode = false;
    userModesDrawer.push(eraserMode);
    let deleteDrawingMode = false;
    userModesDrawer.push(deleteDrawingMode);
    let moveDrawingMode = false;
    userModesDrawer.push(moveDrawingMode);
    let scaleDrawingMode = false;
    userModesDrawer.push(scaleDrawingMode);
    let rotateDrawingMode = false;
    userModesDrawer.push(rotateDrawingMode);
}


function initGeometryEditorControls() {
    userStrokeColor = 'rgba(0,0,0,1.0)';
    userFillColor = 'rgba(0,0,0,1.0)';
    rotateShapeSelectorTriggered = false;
    rotateShapeInputFieldTriggered = false;
    shapeControllerPointCounter = 0;
    initUserModesGeometry();
    initSidemenuControlsGeometry();
}

function initSidemenuControlsGeometry() {
    sidemenuVisible = true;
    triPointX.value = 50;
    triPointY.value = 50;
    scaleInputFieldWidth.value = 100;
    scaleInputFieldHeight.value = 100;
    strokeCheckbox.checked = true;
    sliderStokeWidth.value = 3;
    sliderStokeWidth.wPosition = 3;
    outputStrokeWidth.value = 3;
    fillCheckbox.checked = false;
    shapeRotationSelector.selectedIndex = 0;
    shapeRotationInput.value = 0;
    scaleGeoSlider.value = 1.0;
    scaleGeoOutput.value = 1.0;
}

function initUserModesGeometry() {
    userModesGeometry = [];
    let adedRectMode = false;
    userModesGeometry.push(adedRectMode);
    let addTriangleMode = false;
    userModesGeometry.push(addTriangleMode);
    let addCircleMode = false;
    userModesGeometry.push(addCircleMode);
    let deleteShapeMode = false;
    userModesGeometry.push(deleteShapeMode);
    let moveShapeMode = false;
    userModesGeometry.push(moveShapeMode);
    let scaleShapeMode = false;
    userModesGeometry.push(scaleShapeMode);
    let strokeColorMode = false;
    userModesGeometry.push(strokeColorMode);
    let strokeWidthMode = false;
    userModesGeometry.push(strokeWidthMode);
    let fillColorMode = false;
    userModesGeometry.push(fillColorMode);
    let rotateShapeMode = false;
    userModesGeometry.push(rotateShapeMode);
    let scaleShapeFactorMode = false;
    userModesGeometry.push(scaleShapeFactorMode);
    let thirdPointTriangleMode = false;
    userModesGeometry.push(thirdPointTriangleMode);
}


function initImagesEditorControls() {
    radioImg = true;
    scaleFactor = 1.0;
    rotateImgSelectorTriggered = false;
    rotateImgInputFieldTriggered = false;
    imageControllerPointCounter = 0;
    initUserModesImages();
    initSidemenuControlsImages();
}

function initSidemenuControlsImages() {
    sidemenuVisible = true;   
    scaleInputFieldImgWidth.value = 200;
    scaleInputFieldImgHeight.value = 200;
    scaleImgSlider.value = 1.0;
    scaleImgOutput.value = 1.0;
    opacitySlider.value = 1.0;
    imgRotationSelector.selectedIndex = 0;
    imgRotationInput.value = 0;
}

function initUserModesImages() {
    userModesImages = [];
    let addImageMode = false;
    userModesImages.push(addImageMode);
    let deleteImageMode = false;
    userModesImages.push(deleteImageMode);
    let moveImageMode = false;
    userModesImages.push(moveImageMode);
    let scaleImageMode = false;
    userModesImages.push(scaleImageMode);
    let scaleImageByFactorMode = false;
    userModesImages.push(scaleImageByFactorMode);
    let opacityImageMode = false;
    userModesImages.push(opacityImageMode);
    let rotateImageMode = false;
    userModesImages.push(rotateImageMode);
}


function updateCursorX() {
    const writeLayers = document.getElementsByClassName("write_layer");
    for (let i = 0; i < writeLayers.length; i++) {
        writeLayers[i].addEventListener("mousemove", function(e) {
            let rect = writeLayers[i].getBoundingClientRect();
            let cursorXs = document.getElementsByClassName("cursor_x");
            for (let i = 0; i < cursorXs.length; i++) {
                cursorXs[i].innerText = `Cursor X: ${parseInt(e.clientX - rect.left)}`;
            }
        }, false);
    }
}

function updateCursorY() {
    const writeLayers = document.getElementsByClassName("write_layer");
    for (let i = 0; i < writeLayers.length; i++) {
        writeLayers[i].addEventListener("mousemove", function(e) {
            let rect = writeLayers[i].getBoundingClientRect();
            let cursorYs = document.getElementsByClassName("cursor_y");
            for (let i = 0; i < cursorYs.length; i++) {
                cursorYs[i].innerText = `Cursor Y: ${parseInt(e.clientY - rect.top)}`;
            }
        }, false);
    }
}