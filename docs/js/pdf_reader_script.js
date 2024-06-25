/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 2.0.0
 * @description Reader functions, Editor initialization, Editor navigation
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */



let pdfState = {
    pdf: null,
    currentPage: 1,
    lastPage: 1,
    renderedPage: 0,
    zoom: 1,
    originalPDFBytes: null,
    existingPDFBytes: null,
    originalWidths: [],
    originalHeights: []
}

let startRender;
let endRender;
let pageCounter = 1;
let customFilename;
let pdfFileName;
let isDrawing = false;
let isErasing = false;
let draggingMode = false;
let mouseIsDown = false;
let opBarModes = [];
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
let encrypted;
let relocateLayersMode = false;
const saveButtonsEditor = document.getElementsByClassName('save_pdf_editor');
const inputFileButtons = document.getElementsByClassName('inputfile');


for (let i = 0; i < inputFileButtons.length; i++) {
    inputFileButtons[i].addEventListener("change", function(e) {
        resetAllModes();
        cleanUp();
        const encryptedErrorWidgets = document.getElementsByClassName("encrypted_error");
        const noPDFErrorWidgets = document.getElementsByClassName("no_pdf_error");
        const pagesErrorWidgets = document.getElementsByClassName("pages_error");
        for (let i = 0; i < encryptedErrorWidgets.length; i++) {
            encryptedErrorWidgets[i].style.display = "none";
        }
        for (let i = 0; i < noPDFErrorWidgets.length; i++) {
            noPDFErrorWidgets[i].style.display = "none";
        }
        for (let i = 0; i < pagesErrorWidgets.length; i++) {
            pagesErrorWidgets[i].style.display = "none";
        }
        const file = e.target.files[0];
        const fileReader = new FileReader(); 
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            const pdfBytes = typedarray;
            const loadingTask = pdfjsLib.getDocument(typedarray);
            loadingTask.promise.then(async (pdf) => {
                let originalFilename = file.name;
                if (originalFilename.toLowerCase().endsWith(".pdf")) {
                    try {
                        outputPDF = await PDFLib.PDFDocument.load(pdfBytes);
                    } catch(encryptedErr) {
                        encrypted = true;
                    }
                    if (!encrypted) {
                        if (pdf._pdfInfo.numPages <= 5000) {
                            pdfState.pdf = pdf;
                            pdfState.originalPDFBytes = pdfBytes;
                            pdfState.existingPDFBytes = pdfBytes;
                            pdfFileName = file.name;
                            document.getElementById("current_page").value = 1;
                            let pdfViewers = document.getElementsByClassName("pdf_viewer")
                            for (let i = 0; i < pdfViewers.length; i++) {
                                pdfViewers[i].style.display = "flex";
                            }
                            document.getElementById("reader_controls").style.display = "flex";
                            document.getElementById("viewer_bg").style.display = "flex";
                            document.getElementById('maxPDFPages').innerHTML = pdf._pdfInfo.numPages + " pages";
                            pdfState.lastPage = pdf._pdfInfo.numPages;
                            restrictInputZoom('zoom_factor', 1, 800);
                            setCustomFilename();
                            const scrollwrappers = document.getElementsByClassName('scrollwrapper');
                            for(let i = 0; i < scrollwrappers.length; i++) {
                                scrollwrappers[i].scrollTo(0, 0);
                            }
                            adjustPDFToUserViewport();
                            pdfState.renderedPage = 0;
                            const saveWidgetCons = document.getElementsByClassName("save_widget_con");
                            for (let i = 0; i < saveWidgetCons.length; i++) {
                                saveWidgetCons[i].style.display = "none";
                            }
                            const saveWidgets = document.getElementsByClassName("save_widget");
                            for (let i = 0; i < saveWidgets.length; i++) {
                                saveWidgets[i].style.display = "none";
                            }
                            const renderWidgetCons = document.getElementsByClassName("render_widget_con");
                            for (let i = 0; i < renderWidgetCons.length; i++) {
                                renderWidgetCons[i].style.display = "flex";
                            }
                            const renderWidgets = document.getElementsByClassName("render_widget");
                            for (let i = 0; i < renderWidgets.length; i++) {
                                renderWidgets[i].style.display = "flex";
                            }
                            const pageProgresses = document.getElementsByClassName("page_progress");
                            for (let i = 0; i < pageProgresses.length; i++) {
                                pageProgresses[i].innerText = `${pdfState.renderedPage}`;
                            }
                            let readerMode = true;
                            let editorMode = false;
                            const openPDFs = document.getElementsByClassName("open_pdf");
                            for (let i = 0; i < openPDFs.length; i++) {
                                if (openPDFs[i].classList.contains("btn-outline-success")) {
                                    readerMode = true;
                                    break;
                                } else if (openPDFs[i].classList.contains("btn-success")) {
                                    readerMode = false;
                                }
                            }
                            const editorBtns = document.getElementsByClassName("editor_btn");
                            for (let i = 0; i < editorBtns.length; i++) {
                                if (editorBtns[i].classList.contains("btn-outline-success")) {
                                    editorMode = true;
                                    break;
                                } else if (editorBtns[i].classList.contains("btn-success")) {
                                    editorMode = false;
                                }
                            }
                            if (!readerMode && editorMode) {
                                onetimeSetup = true;
                                document.getElementById('layer_stack').style.display = "flex";
                                const sidemenus = document.getElementsByClassName("sidemenu");
                                for (let i = 0; i < sidemenus.length; i++) {
                                    sidemenus[i].style.display = "flex";
                                }
                                if (displayEditControls.getAttribute("data-mode") === "edit_text") {
                                    displayTextTools();
                                }
                                if (displayEditControls.getAttribute("data-mode") === "edit_draw") {
                                    displayDrawTools();
                                }
                                if (displayEditControls.getAttribute("data-mode") === "edit_shape") {
                                    displayShapeTools();
                                }
                                if (displayEditControls.getAttribute("data-mode") === "edit_image") {
                                    displayImgTools();
                                }
                                const sidemenuWrappers = document.getElementsByClassName("sidemenu_wrapper");
                                for (let i = 0; i < sidemenuWrappers.length; i++) {
                                    sidemenuWrappers[i].scrollTo(0, 0);
                                }
                                const layerStackWrappers = document.getElementsByClassName("layer_stack_wrapper");
                                for (let i = 0; i < layerStackWrappers.length; i++) {
                                    layerStackWrappers[i].scrollTo(0, 0);
                                }
                                setTimeout(initEditor, 300);
                            }
                            startRender = performance.now();
                            await renderPage(pageCounter, false);
                        } else {
                            for (let i = 0; i < pagesErrorWidgets.length; i++) {
                                pagesErrorWidgets[i].style.display = "flex";
                            }
                        }
                    } else {
                        for (let i = 0; i < encryptedErrorWidgets.length; i++) {
                            encryptedErrorWidgets[i].style.display = "flex";
                        }
                    }
                }
            }).catch(unsupportedFileErr => {
                for (let i = 0; i < noPDFErrorWidgets.length; i++) {
                    noPDFErrorWidgets[i].style.display = "flex";
                }
            });
        }
        if (file) {
            fileLoaded = true;
            fileReader.readAsArrayBuffer(file);
        }
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
    opBarModes = [];
    userModes = [];
    userModesDrawer = [];
    userModesGeometry = [];
    userModesImages = [];
    fontBytes = [];
    imagesBase64Strings = [];
    pageCounter = 1;
    encrypted = false;
    fileLoaded = false;
    pdfState.pdf = null;
    pdfState.currentPage = 1;
    pdfState.lastPage = 1;
    pdfState.renderedPage = 0;
    pdfState.zoom = 1;
    pdfState.originalPDFBytes = null;
    pdfState.existingPDFBytes = null;
    pdfState.originalWidths = [];
    pdfState.originalHeights = [];
}


for (let h = 0; h < saveButtonsEditor.length; h++) {
    saveButtonsEditor[h].addEventListener("click", async function() {
        const startSave = performance.now();
        resetAllModes();  
        const saveWidgetCons = document.getElementsByClassName("save_widget_con");
        for (let i = 0; i < saveWidgetCons.length; i++) {
            saveWidgetCons[i].style.display = "flex";
        }
        const saveWidgets = document.getElementsByClassName("save_widget");
        for (let i = 0; i < saveWidgets.length; i++) {
            saveWidgets[i].style.display = "flex";
        }
        const editImgs = document.getElementsByClassName("editimg");
        if (editImgs.length > 0) { 
            let originalZoom = pdfState.zoom;
            pdfState.zoom = 5;
            zoomForSave().then(function(step) {
                console.log(step);
                return canvasToImage();
            }).then(async function(step) {
                console.log(step); 
                return compressToZip(pdfState.existingPDFBytes, customFilename);
            }).then(function(blob) { 
                console.log("Archived to ZIP");
                return downloadPDF(blob, customFilename);
            }).then(function(step) {
                console.log(step); 
                pdfState.zoom = originalZoom;
                return zoomForSave();
            }).then(function(step) {
                console.log(step);
                for (let i = 0; i < saveWidgetCons.length; i++) {
                    saveWidgetCons[i].style.display = "none";
                }
                for (let i = 0; i < saveWidgets.length; i++) {
                    saveWidgets[i].style.display = "none";
                }
                console.log("Finished");
                const endSave = performance.now();
                console.log(`Execution time of Editor: ${endSave - startSave} ms`);
            });
        } else {
            compressToZip(pdfState.existingPDFBytes, customFilename).then(function(blob) {
                console.log("Archived to ZIP");
                return downloadPDF(blob, customFilename);
            }).then(function(step) {
                console.log(step);
                for (let i = 0; i < saveWidgetCons.length; i++) {
                    saveWidgetCons[i].style.display = "none";
                }
                for (let i = 0; i < saveWidgets.length; i++) {
                    saveWidgets[i].style.display = "none";
                }
                console.log("Finished");
                const endSave = performance.now();
                console.log(`Execution time: ${endSave - startSave} ms`);
            });
        }
    }, false);
}

async function canvasToImage() {
    outputPDF = await PDFLib.PDFDocument.load(pdfState.originalPDFBytes);
    const editImgs = document.getElementsByClassName("visible");
    for (let j = 0; j < editImgs.length; j++) {
        const editImg = editImgs[j];
        const dataURL = editImg.toDataURL("image/png", 1.0);
        const splittedDataURL = dataURL.split(",", 2);
        const pngImage = await outputPDF.embedPng(splittedDataURL[1]);
        const thisPage = parseInt(editImg.getAttribute("data-page"), 10);
        outputPDF.getPages()[thisPage-1].drawImage(pngImage, {
            x: 0,
            y: 0,
            width: pdfState.originalWidths[thisPage-1],
            height: pdfState.originalHeights[thisPage-1]
        });
    }
    pdfState.existingPDFBytes = await outputPDF.save();
    return "PDF saved";
}

function zoomForSave() {
    return new Promise((resolve, reject) => {
        pageCounter = 1;
        setTimeout(() => {
            placeEditorElements();
        }, 300);
        renderPage(pageCounter, false);
        setTimeout(() => {
            resolve("zoom for saving");
        }, 300);
    });
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
    if (pdfState.currentPage >= pdfState.renderedPage) {
        pdfState.currentPage = pdfState.renderedPage;
        document.getElementById('current_page').value = pdfState.renderedPage;
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
        let successValue = convertInputToSucess(desiredPage, 1, pdfState.renderedPage, true, false);
        if (successValue !== -1000) {
            pdfState.currentPage = successValue;
            document.getElementById("current_page").value = pdfState.currentPage;
            jumpTo(pdfState.currentPage);
        }
    }
}

function displayPageNum(e) {
    let scrollDistance = e.target.scrollTop; 
    let scrolledPageHeight = 0;
    let displayedPage = 0;
    let canvasElems = document.getElementsByClassName('render_context');
    for (let i = 0; i < pdfState.renderedPage; i++) {
        if (scrolledPageHeight <= scrollDistance) {
            scrolledPageHeight += canvasElems[i].height;
            displayedPage++; 
            document.getElementById("current_page").value = displayedPage;
            pdfState.currentPage = displayedPage;
        } else {
            document.getElementById("current_page").value = displayedPage;
            pdfState.currentPage = displayedPage;
            break;
        }
    }
}

async function renderPage(num, renderSingle) {
    pdfState.pdf.getPage(num).then(function(page) {
        let viewport = page.getViewport({
            scale: pdfState.zoom
        });
        let viewportOriginal = page.getViewport({
            scale: 1
        });
        let canvas;
        let div;
        const pdfViewers = document.getElementsByClassName("pdf_viewer");
        for (let i = 0; i < pdfViewers.length; i++) {
            const pdfViewer = pdfViewers[i];
            if (viewport.width > parseInt(pdfViewer.style.width, 10)) {
                pdfViewer.style.width = viewport.width + "px";
            }
            if (writeLayerStack.length < pdfState.pdf._pdfInfo.numPages) {
                div = document.createElement("div");
                div.style.display = "flex";
                div.width = viewport.width;
                div.height = viewport.height;
                div.style.width = viewport.width + "px";
                div.style.height = viewport.height + "px";
                div.style.marginBottom = "20px";
                pdfState.originalWidths.push(viewportOriginal.width);
                pdfState.originalHeights.push(viewportOriginal.height);
                div.setAttribute('data-write', pageCounter);
                div.classList.add("write_layer");
                canvas = document.createElement("canvas");
                canvas.style.display = "flex";
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = viewport.width + "px";
                canvas.style.height = viewport.height + "px";
                canvas.setAttribute('data-page', pageCounter);
                canvas.classList.add("render_context");
                div.appendChild(canvas);
                pdfViewer.appendChild(div);
                writeLayerStack.push(div);
            } else if (writeLayerStack.length === pdfState.pdf._pdfInfo.numPages) {
                if (!renderSingle) {
                    div = writeLayerStack[pageCounter-1];
                    canvas = writeLayerStack[pageCounter-1].childNodes[0];
                } else {
                    div = writeLayerStack[num-1];
                    canvas = writeLayerStack[num-1].childNodes[0];
                }
                div.width = viewport.width;
                div.height = viewport.height;
                div.style.width = viewport.width + "px";
                div.style.height = viewport.height + "px";
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = viewport.width + "px";
                canvas.style.height = viewport.height + "px";
            }
        }
        const context = canvas.getContext('2d');
        let renderTask = page.render({
            canvasContext: context,
            viewport: viewport
        });
        if (!renderSingle) {
            renderTask.promise.then(async function() {
                pdfState.renderedPage = pageCounter;
                restrictInputValues('current_page', 1, pdfState.renderedPage, true, false);
                const pageProgresses = document.getElementsByClassName("page_progress");
                for (let i = 0; i < pageProgresses.length; i++) {
                    pageProgresses[i].innerText = `${pdfState.renderedPage}`;
                }
                pageCounter++;
                if (pageCounter > pdfState.lastPage) {
                    const renderWidgetCons = document.getElementsByClassName("render_widget_con");
                    for (let i = 0; i < renderWidgetCons.length; i++) {
                        renderWidgetCons[i].style.display = "none";
                    }
                    const renderWidgets = document.getElementsByClassName("render_widget");
                    for (let i = 0; i < renderWidgets.length; i++) {
                        renderWidgets[i].style.display = "none";
                    }
                    endRender = performance.now();
                    console.log(`Execution time of Render Operation: ${endRender - startRender} ms`);
                } 
                if (pdfState.pdf != null && pageCounter <= pdfState.pdf._pdfInfo.numPages) {
                    renderPage(pageCounter, false);
                }
            });
        }
    });
}

function adjustPDFToUserViewport() {
    const vW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const firstPage = outputPDF.getPages()[0];
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


function debounce(func, delay) { 
    let inDebounce; 
    return function () { 
        const context = this; 
        const args = arguments; 
        clearTimeout(inDebounce); 
        inDebounce = setTimeout(() => func.apply(context, args), delay); 
    }; 
} 
   
const debouncedZoomIn = debounce(zoomIn, 300); 
const debouncedZoomOut = debounce(zoomOut, 300);
const debouncedEnterZoomFactor = debounce(enterZoomFactor, 300);
  
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
            await renderPage(pageCounter, false);
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
            renderPage(pageCounter, false);
        }
    }
}

async function enterZoomFactor(e) {
    resetAllModes();
    e.preventDefault;
    if (e.key == 'Enter') {
        let desiredZoom = document.getElementById('zoom_factor').value;
        let successValue = convertZoomInputToSucess(desiredZoom, 1, 800);
        if (successValue !== -1000) {
            const oldZoom = pdfState.zoom;
            let percent = toPercent(oldZoom);
            if (percent !== successValue) {
                pdfState.zoom = toFactor(successValue);
                document.getElementById("zoom_factor").value = successValue + "%";
                placeEditorElements();
                pageCounter = 1;
                renderPage(pageCounter, false);
            }
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
            zoomDrawing(controllerPoint, controllerPoint.elementToControl.paths, pdfState.zoom, pdfState.zoom);
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
    const pageIndex = controlP.page-1;
    controlP.editImg.width = pdfState.originalWidths[pageIndex] * pdfState.zoom;
    controlP.editImg.height = pdfState.originalHeights[pageIndex] * pdfState.zoom;
    controlP.editImg.style.width = (pdfState.originalWidths[pageIndex] * pdfState.zoom) + "px";
    controlP.editImg.style.height = (pdfState.originalHeights[pageIndex] * pdfState.zoom) + "px";
    const currentText = controlP.elementToControl;
    await updateUserLayer(controlP, currentText.pdfBytes); 
}

function zoomDrawing(controlP, pathElement2D, zoomWidth, zoomHeight) {
    let context = controlP.editImg.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);  
    context.save();
    scaleCanvas(controlP, zoomWidth, zoomHeight);
    for (let i = 0; i < pathElement2D.length; i++) {
        context.beginPath();  
        context.lineCap = "round";
        context.lineJoin = "round";       
        context.lineWidth = pathElement2D.paths[i][0].line;
        context.strokeStyle = pathElement2D.paths[i][0].color;   
        context.globalCompositeOperation = pathElement2D[i][0].compositeOp;
        context.moveTo(pathElement2D[i][0].x, pathElement2D[i][0].y); 
        
        for (let j = 1; j < pathElement2D[i].length; j++)
            context.lineTo(pathElement2D[i][j].x, pathElement2D[i][j].y);
        
        context.stroke();
    }
    context.restore();
}

// function zoomDrawing(controlP, zoomWidth, zoomHeight) {
//     let context = controlP.editImg.getContext("2d");
//     context.clearRect(0, 0, context.canvas.width, context.canvas.height);  
//     context.save();
//     scaleCanvas(controlP, zoomWidth, zoomHeight);
//     for (let i = 0; i < controlP.elementToControl.paths.length; i++) {
//         context.beginPath();  
//         context.lineCap = "round";
//         context.lineJoin = "round";       
//         context.lineWidth = controlP.elementToControl.paths[i][0].line;
//         context.strokeStyle = controlP.elementToControl.paths[i][0].color;   
//         context.globalCompositeOperation = controlP.elementToControl.paths[i][0].compositeOp;
//         context.moveTo(controlP.elementToControl.paths[i][0].x, controlP.elementToControl.paths[i][0].y); 
        
//         for (let j = 1; j < controlP.elementToControl.paths[i].length; j++)
//             context.lineTo(controlP.elementToControl.paths[i][j].x, controlP.elementToControl.paths[i][j].y);
        
//         context.stroke();
//     }
//     context.restore();
// }

function scaleCanvas(controlP, zoomWidth, zoomHeight) {
    const pageIndex = controlP.page-1;
    controlP.editImg.width = pdfState.originalWidths[pageIndex] * pdfState.zoom;
    controlP.editImg.height = pdfState.originalHeights[pageIndex] * pdfState.zoom;
    controlP.editImg.style.width = (pdfState.originalWidths[pageIndex] * pdfState.zoom) + "px";
    controlP.editImg.style.height = (pdfState.originalHeights[pageIndex] * pdfState.zoom) + "px";
    let context = controlP.editImg.getContext("2d");
    let width = context.canvas.width;
    let height = context.canvas.height;
    context.translate(width, height);
    context.scale(zoomWidth, zoomHeight);
    context.translate(-width/zoomWidth, -height/zoomHeight); 
    if (opBarModes[1]) {
        context.globalCompositeOperation = 'source-over';
    } else if (opBarModes[6]) {
        context.globalCompositeOperation = 'destination-out';
    } 
};

async function zoomImages(controlP) {
    const pageIndex = controlP.page-1;
    controlP.editImg.width = pdfState.originalWidths[pageIndex] * pdfState.zoom;
    controlP.editImg.height = pdfState.originalHeights[pageIndex] * pdfState.zoom;
    controlP.editImg.style.width = (pdfState.originalWidths[pageIndex] * pdfState.zoom) + "px";
    controlP.editImg.style.height = (pdfState.originalHeights[pageIndex] * pdfState.zoom) + "px";
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
    const pageIndex = parseInt(editImg.getAttribute("data-page"), 10) - 1;
    editImg.width = pdfState.originalWidths[pageIndex] * pdfState.zoom;
    editImg.height = pdfState.originalHeights[pageIndex] * pdfState.zoom;
    editImg.style.width = (pdfState.originalWidths[pageIndex] * pdfState.zoom) + "px";
    editImg.style.height = (pdfState.originalHeights[pageIndex] * pdfState.zoom) + "px";
    let ctx = editImg.getContext("2d");
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;
    ctx.translate(width, height);
    ctx.scale(pdfState.zoom, pdfState.zoom);
    ctx.translate(-width/pdfState.zoom, -height/pdfState.zoom); 
}

function toPercent(factor) {
    let percentString = Number(factor).toLocaleString("en-GB", { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
    let outputPercent = percentString.substring(0, percentString.length-2);
    let percentInt = parseInt(outputPercent, 10);
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

document.getElementById('zoom_in').addEventListener('click', debouncedZoomIn, false);
document.getElementById('zoom_factor').addEventListener('keypress', debouncedEnterZoomFactor, false);
document.getElementById('zoom_out').addEventListener('click', debouncedZoomOut, false);


const dragPDFs = document.getElementsByClassName("dragpdf");
for (let j = 0; j < dragPDFs.length; j++) {
    dragPDFs[j].addEventListener("click", function() {
        resetAllModes();
        draggingMode = true;
        const writeLayers = document.getElementsByClassName("write_layer");
        for (let i = 0; i < writeLayers.length; i++) {
            writeLayers[i].onmousedown = null;
        }
        const pdfViewerCons = document.getElementsByClassName("dragwrapper");
        for (let i = 0; i < pdfViewerCons.length; i++) {
            dragElement(pdfViewerCons[i]);
        }
    }, false);
}

function dragElement(elmnt) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    let currentWriteLayer;
    let successValue = convertInputToSucess(document.getElementById("current_page").value, 1, pdfState.lastPage, true, false);
    if (successValue !== -1000) {
        const writeLayers = document.getElementsByClassName("write_layer");
        for (let i = 0; i < writeLayers.length; i++) {
            if (parseInt(writeLayers[i].getAttribute("data-write"), 10) === successValue) {
                currentWriteLayer = writeLayers[i];
            }
        }
        currentWriteLayer.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        if (draggingMode) {
            mouseIsDown = true;
            currentWriteLayer.style.cursor = "move";
            pos3 = e.clientX;
            pos4 = e.clientY;
            currentWriteLayer.onmouseup = closeDragElement;
            currentWriteLayer.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        if (draggingMode && mouseIsDown) {
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
            currentWriteLayer.style.cursor = "default";
            currentWriteLayer.onmouseup = null;
            currentWriteLayer.onmousemove = null;
        }
    }
}


if (document.getElementById('spin_right') !== undefined && document.getElementById('spin_right') !== null) {
    document.getElementById("spin_right").addEventListener("click", async function() {
        resetAllModes();
        let currentPage = convertInputToSucess(document.getElementById("current_page").value, 1, pdfState.lastPage, true, false);
        if (currentPage !== -1000) {
            let currentRotation = outputPDF.getPages()[currentPage-1].getRotation().angle;
            let newRotation = currentRotation + 90;
            if (newRotation === 360) {
                newRotation = 0;
            }
            await setPageRotation(currentPage, newRotation);
        }
    }, false);
}

if (document.getElementById('spin_left') !== undefined && document.getElementById('spin_left') !== null) {
    document.getElementById("spin_left").addEventListener("click", async function() {
        resetAllModes();
        let currentPage = convertInputToSucess(document.getElementById("current_page").value, 1, pdfState.lastPage, true, false);
        if (currentPage !== -1000) {
            let currentRotation = outputPDF.getPages()[currentPage-1].getRotation().angle;
            let newRotation = currentRotation - 90;
            if (newRotation === -360) {
                newRotation = 0;
            }
            await setPageRotation(currentPage, newRotation);
        }
    }, false);
}

async function setPageRotation(currentPage, newRotation) {
    outputPDF.getPages()[currentPage-1].setRotation(PDFLib.degrees(newRotation));
    pdfState.existingPDFBytes = await outputPDF.save();
    const loadingTask = pdfjsLib.getDocument(pdfState.existingPDFBytes);
    loadingTask.promise.then(pdf => {
        pdfState.pdf = pdf;
        renderPage(currentPage, true);
    }); 
    let writeLayers = document.getElementsByClassName("write_layer");
    let renderContextes = document.getElementsByClassName("render_context");
    let newWidth = writeLayers[currentPage-1].height;
    let newHeight = writeLayers[currentPage-1].width;
    writeLayers[currentPage-1].width = newWidth;
    writeLayers[currentPage-1].height = newHeight;
    let pdfStateOrigWidth = pdfState.originalWidths[currentPage-1];
    let pdfStateOrigHeight = pdfState.originalHeights[currentPage-1];
    pdfState.originalWidths[currentPage-1] = pdfStateOrigHeight;
    pdfState.originalHeights[currentPage-1] = pdfStateOrigWidth;
    renderContextes[currentPage-1].width = newWidth;
    renderContextes[currentPage-1].height = newHeight;
}


function resetOpBarModes() {
    if (opBarModes.length > 0) {
        for (let i = 0; i < opBarModes.length; i++) {
            opBarModes[i] = false;
        } 
    }
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
    resetOpBarModes();
    resetUserModes();
    resetUserModesDrawer();
    resetUserModesGeometry();
    resetUserModesImages();
    leaveRelocateLayersEvent();
    draggingMode = false;
    isDrawing = false;
    isErasing = false;
    mouseIsDown = false;
}


if (document.getElementsByClassName("display_edit_ctls")[0] !== undefined && document.getElementsByClassName("display_edit_ctls")[0] !== null) {
    displayEditControls = document.getElementsByClassName("display_edit_ctls")[0];
}

function displayTextTools() {
    const sidemenuTexts = document.getElementsByClassName("sidemenu_text_display");
    for (let i = 0; i < sidemenuTexts.length; i++) {
        sidemenuTexts[i].style.display = "flex";
    }
    const sidemenuDraws = document.getElementsByClassName("sidemenu_draw_display");
    for (let i = 0; i < sidemenuDraws.length; i++) {
        sidemenuDraws[i].style.display = "none";
    }
    const sidemenuShapes = document.getElementsByClassName("sidemenu_shape_display");
    for (let i = 0; i < sidemenuShapes.length; i++) {
        sidemenuShapes[i].style.display = "none";
    }
    const sidemenuImgs = document.getElementsByClassName("sidemenu_img_display");
    for (let i = 0; i < sidemenuImgs.length; i++) {
        sidemenuImgs[i].style.display = "none";
    }
    const operations_bars = document.getElementsByClassName("operations_bar");
    for (let i = 0; i < operations_bars.length; i++) {
        operations_bars[i].style.display = "flex";
    }
    document.getElementById('editor_controls').style.display = "flex";
    document.getElementById('pencil_controls').style.display = "none";
    document.getElementById('shape_controls').style.display = "none";
    document.getElementById('img_controls').style.display = "none";  
}

function displayDrawTools() {
    const sidemenuTexts = document.getElementsByClassName("sidemenu_text_display");
    for (let i = 0; i < sidemenuTexts.length; i++) {
        sidemenuTexts[i].style.display = "none";
    }
    const sidemenuDraws = document.getElementsByClassName("sidemenu_draw_display");
    for (let i = 0; i < sidemenuDraws.length; i++) {
        sidemenuDraws[i].style.display = "flex";
    }
    const sidemenuShapes = document.getElementsByClassName("sidemenu_shape_display");
    for (let i = 0; i < sidemenuShapes.length; i++) {
        sidemenuShapes[i].style.display = "none";
    }
    const sidemenuImgs = document.getElementsByClassName("sidemenu_img_display");
    for (let i = 0; i < sidemenuImgs.length; i++) {
        sidemenuImgs[i].style.display = "none";
    }
    const operations_bars = document.getElementsByClassName("operations_bar");
    for (let i = 0; i < operations_bars.length; i++) {
        operations_bars[i].style.display = "flex";
    }
    document.getElementById('pencil_controls').style.display = "flex";
    document.getElementById('editor_controls').style.display = "none";
    document.getElementById('shape_controls').style.display = "none";
    document.getElementById('img_controls').style.display = "none";
}

function displayShapeTools() {
    const sidemenuTexts = document.getElementsByClassName("sidemenu_text_display");
    for (let i = 0; i < sidemenuTexts.length; i++) {
        sidemenuTexts[i].style.display = "none";
    }
    const sidemenuDraws = document.getElementsByClassName("sidemenu_draw_display");
    for (let i = 0; i < sidemenuDraws.length; i++) {
        sidemenuDraws[i].style.display = "none";
    }
    const sidemenuShapes = document.getElementsByClassName("sidemenu_shape_display");
    for (let i = 0; i < sidemenuShapes.length; i++) {
        sidemenuShapes[i].style.display = "flex";
    }
    const sidemenuImgs = document.getElementsByClassName("sidemenu_img_display");
    for (let i = 0; i < sidemenuImgs.length; i++) {
        sidemenuImgs[i].style.display = "none";
    }
    const operations_bars = document.getElementsByClassName("operations_bar");
    for (let i = 0; i < operations_bars.length; i++) {
        operations_bars[i].style.display = "flex";
    }
    document.getElementById('editor_controls').style.display = "none";
    document.getElementById('pencil_controls').style.display = "none";
    document.getElementById('shape_controls').style.display = "flex";
    document.getElementById('img_controls').style.display = "none";
}

function displayImgTools() {
    const sidemenuTexts = document.getElementsByClassName("sidemenu_text_display");
    for (let i = 0; i < sidemenuTexts.length; i++) {
        sidemenuTexts[i].style.display = "none";
    }
    const sidemenuDraws = document.getElementsByClassName("sidemenu_draw_display");
    for (let i = 0; i < sidemenuDraws.length; i++) {
        sidemenuDraws[i].style.display = "none";
    }
    const sidemenuShapes = document.getElementsByClassName("sidemenu_shape_display");
    for (let i = 0; i < sidemenuShapes.length; i++) {
        sidemenuShapes[i].style.display = "none";
    }
    const sidemenuImgs = document.getElementsByClassName("sidemenu_img_display");
    for (let i = 0; i < sidemenuImgs.length; i++) {
        sidemenuImgs[i].style.display = "flex";
    }
    const operations_bars = document.getElementsByClassName("operations_bar");
    for (let i = 0; i < operations_bars.length; i++) {
        operations_bars[i].style.display = "flex";
    }
    document.getElementById('editor_controls').style.display = "none";
    document.getElementById('pencil_controls').style.display = "none";
    document.getElementById('shape_controls').style.display = "none";
    document.getElementById('img_controls').style.display = "flex";
}


if (document.getElementById("writepdfbtn") !== undefined && document.getElementById("writepdfbtn") !== null) {
    writePdfBtn = document.getElementById("writepdfbtn");
    writePdfBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightTextButton();
        if (fileLoaded && !encrypted) {
            displayTextTools();
        }
    }, false);
}

if (document.getElementById("drawpdfbtn") !== undefined && document.getElementById("drawpdfbtn") !== null) {
    drawPdfBtn = document.getElementById("drawpdfbtn");
    drawPdfBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightDrawButton();
        if (fileLoaded && !encrypted) {
            displayDrawTools();
        }
    }, false);
}

if (document.getElementById("geometrybtn") !== undefined && document.getElementById("geometrybtn") !== null) {
    geometryBtn = document.getElementById("geometrybtn");
    geometryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightShapeButton();
        if (fileLoaded && !encrypted) {
            displayShapeTools();
        }
    }, false);
}

if (document.getElementById("imagesbtn") !== undefined && document.getElementById("imagesbtn") !== null) {
    imagesBtn = document.getElementById("imagesbtn");
    imagesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllModes();
        highlightImageButton();
        if (fileLoaded && !encrypted) {
            displayImgTools();
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
    if (onetimeSetup) {
        onetimeSetup = false;
        sidemenuVisible = true;
        layersVisible = true;
        boxApplyMode = true;
        layerApplyMode = false;
        document.getElementById('show_btns').style.display = "none";
        initLayerVariables();
        initOpBarModes();
        initTextEditorControls();
        restrictInputValues('lineheight_input', 1, 300, true, false);
        restrictInputValues('textsize_input', 3, 500, true, false);
        restrictInputValues('textrotation_input', -360, 360, true, false);
        initDrawerEditorControls();
        restrictInputValues('scale_width_draw', 0.1, 20.0, false, true);
        restrictInputValues('scale_height_draw', 0.1, 20.0, false, true);
        restrictInputValues('pencilsize', 0.1, 500.0, false, true);
        restrictInputValues('drawrotation_input', -360, 360, true, false);
        initGeometryEditorControls();
        restrictInputValues('scale_width', 1, 3000, true, false);
        restrictInputValues('scale_height', 1, 3000, true, false);
        restrictInputValues('xp2', 1, 3000, true, false);
        restrictInputValues('yp2', 1, 3000, true, false);
        restrictInputValues('shaperotation_input', -360, 360, true, false);
        restrictInputValues('scale_factor_geo', 0.1, 20.0, false, true);
        restrictInputValues('strokewidth', 0.1, 200.0, true, false);
        initImagesEditorControls();
        restrictInputValues('scale_width_img', 1, 3000, true, false);
        restrictInputValues('scale_height_img', 1, 3000, true, false);
        restrictInputValues('scale_factor_img', 0.1, 20.0, false, true);
        restrictInputValues('img_opacity', 0.01, 1.0, false, true);
        restrictInputValues('imgrotation_input', -360, 360, true, false); 
        updateCursorX();
        updateCursorY();
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

function initOpBarModes() {
    opBarModes = [];
    let addTextMode = false;
    opBarModes.push(addTextMode);
    let pencilMode = false;
    opBarModes.push(pencilMode);
    let addRectMode = false;
    opBarModes.push(addRectMode);
    let addTriMode = false;
    opBarModes.push(addTriMode);
    let addEllipseMode = false;
    opBarModes.push(addEllipseMode);
    let addImageMode = false;
    opBarModes.push(addImageMode);
    let eraserMode = false;
    opBarModes.push(eraserMode);
    let deleteMode = false;
    opBarModes.push(deleteMode);
    let moveMode = false;
    opBarModes.push(moveMode);
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
    fontSizeSelector.selectedIndex = 1;
    sizeInput.value = 30;
    textRotationSelector.selectedIndex = 0; 
    textRotationInput.value = 0;
    lineheightSelector.selectedIndex = 3;
    lineheightInput.value = 34;
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
    pencilsizeInput.value = 4;
    drawRotationSelector.selectedIndex = 0;
    drawRotationInput.value = 0;
}

function initUserModesDrawer() {
    userModesDrawer = [];
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
    strokeWidthInput.value = 4;
    fillCheckbox.checked = false;
    shapeRotationSelector.selectedIndex = 0;
    shapeRotationInput.value = 0;
    scaleByFactorInput.value = 1;
}

function initUserModesGeometry() {
    userModesGeometry = [];
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
    scaleByFactorImg.value = 1;
    imgOpacityInput.value = 1;
    imgRotationSelector.selectedIndex = 0;
    imgRotationInput.value = 0;
}

function initUserModesImages() {
    userModesImages = [];
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
                cursorXs[i].innerText = `${parseInt((e.clientX - rect.left), 10)}`;
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
                cursorYs[i].innerText = `${parseInt((e.clientY - rect.top), 10)}`;
            }
        }, false);
    }
}


function leaveRelocateLayersEvent() {
    if (relocateLayersMode) {
        const boxes = document.getElementsByClassName("box");
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].onmousedown = null;
        }
        relocateLayersMode = false;
        controlBoxTouched = false;
    }
}