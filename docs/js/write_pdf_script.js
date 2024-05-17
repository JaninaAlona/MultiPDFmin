/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 2.0.0
 * @description Writer Functions
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */



const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib

let userText = {
    pdfDoc: null,
    pdfBytes: null,
    text: '',
    x: 1,
    y: 1,
    size: 1,
    fontKey: null,
    font: null,
    lineHeight: 34,
    color: rgb(0, 0, 0),
    page: 1,
    opacity: 1.0,
    rotation: degrees(0),
    setTextElem() {
        this.pdfDoc.getPages()[0].drawText(this.text, {
            x: this.x,
            y: this.y,
            size: this.size,
            font: this.font,
            color: this.color,
            lineHeight: this.lineHeight,
            rotate: this.rotation
        });
    }
}

let controlPoint = {
    controlBox: null,
    editImg: null,
    elementToControl: null,
    type: '',
    layer: null,
    page: 1,
    x: 0,
    y: 0,
    index: 0,
    setControlPoint() {
        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = this.x + "px";
        div.style.top = this.y + "px";
        div.setAttribute('data-page', this.layer.getAttribute("data-write"));
        div.setAttribute('data-index', this.index);
        div.classList.add(this.type);
        div.classList.add("box");
        this.controlBox = div;
    }
}

const colorPickerFont = new Alwan('#colorpicker', {
    theme: 'dark',
    toggle: 'false',
    popover: 'false',
    color: '#000',
    default: '#000',
    format: 'rgb',
    singleInput: false,
    opacity: true,
    preview: true,
    closeOnScroll: false,
    copy: true
});

let textControllerPointCounter = 0;
let userFontColor;
let userFontOpacity;
let fontSizeSelectorTriggered = false;
let fontSizeInputFieldTriggered = false;
let rotateTextSelectorTriggered = false;
let rotateTextInputFieldTriggered = false;
let lineheightSelectorTriggered = false;
let lineheightInputFieldTriggered = false;
const textarea = document.getElementById('applytextarea');
const fontSelector = document.querySelector('#fontsel');
const fontSizeSelector = document.querySelector('#fontsizesel');
let sizeInput = document.querySelector('#textsize_input');
let textRotationSelector = document.querySelector('#rotatetextsel');
let textRotationInput = document.querySelector('#textrotation_input');
let lineheightSelector = document.querySelector('#lineheightsel');
let lineheightInput = document.querySelector("#lineheight_input");


document.getElementById('addtext').addEventListener("click", async function() {
    resetAllModes();
    userModes[0] = true;
    for(let i = 0; i < writeLayerStack.length; i++) {
        writeLayerStack[i].onclick = async function(e) {
            await addText(e, writeLayerStack[i]);
        }
    }
}, false);

async function addText(event, writeLayer) {
    if (userModes[0]) {
        const currentUserText = Object.create(userText);
        const controlP = Object.create(controlPoint);
        const pdfLayer = await PDFDocument.create();
        const font = await pdfLayer.embedFont(StandardFonts.TimesRoman);
        const pageLayer = pdfLayer.addPage([writeLayer.width, writeLayer.height]);
        let rect = writeLayer.getBoundingClientRect();
        let mousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        let writePage = parseInt(writeLayer.getAttribute("data-write"), 10);
        currentUserText.pdfDoc = pdfLayer;
        currentUserText.text = "dummy";
        currentUserText.x = mousePos.x / pdfState.zoom;
        currentUserText.y = writeLayer.height - mousePos.y / pdfState.zoom;
        currentUserText.size = 30;
        currentUserText.fontKey = StandardFonts.TimesRoman;
        currentUserText.font = font;
        currentUserText.lineHeight = 34;
        currentUserText.color = rgb(0, 0, 0);
        currentUserText.page = writePage;
        currentUserText.opacity = 1.0;
        currentUserText.rotation = degrees(0);
        currentUserText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentUserText.pdfBytes = pdfLayerBytes;
        controlP.x = mousePos.x;
        controlP.y = mousePos.y;
        controlP.elementToControl = currentUserText;
        controlP.type = "text";
        controlP.layer = writeLayer;
        controlP.page = writePage;
        controlP.index = textControllerPointCounter;
        textControllerPointCounter++;
        controlP.setControlPoint();
        controlP.x = mousePos.x/pdfState.zoom;
        controlP.y = mousePos.y/pdfState.zoom;
        const canvasContainer = createUserLayer("text", writePage, controlP, writeLayer, pdfLayerBytes);
        controlP.editImg = canvasContainer;
        userTextList.push(controlP);
    }
}


document.getElementById('movetext').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[2] = true;
        for(let i = 0; i < userTextList.length; i++) {
            moveText(userTextList[i]);
        }
    }
    if (layerApplyMode) {
        const selectedLayers = document.getElementsByClassName("layer_selected");
        for(let i = 0; i < selectedLayers.length; i++) {
            if (selectedLayers[i].classList.contains("unlocked")) {
                relocateLayers(selectedLayers[i]);
            }
        }  
    }
}, false);

function moveText(textBox) {
    let x = 0;
    let y = 0;
    mouseIsDown = false;
    let controlBoxTouched = false;
    textBox.controlBox.onmousedown = startMovingText;    

    function startMovingText(e) {
        let disable = checkForLockStatus(textBox.controlBox);
        if (disable) {
            userModes[2] = false;
        }
        if (userModes[2]) {
            mouseIsDown = true;
            markSingleLayerOnEdit(textBox);
            x = textBox.controlBox.offsetLeft - e.clientX;
            y = textBox.controlBox.offsetTop - e.clientY;
            window.onmouseup = stopMovingText;
            textBox.controlBox.onmousemove = movingText;
            controlBoxTouched = true;
            e.preventDefault();
        }
    }

    function movingText(e) {
        if (userModes[2] && mouseIsDown) {
            textBox.controlBox.style.left = (e.clientX + x) + "px";
            textBox.controlBox.style.top = (e.clientY + y) + "px"; 
            textBox.x = (e.clientX + x)/pdfState.zoom;
            textBox.y = (e.clientY + y)/pdfState.zoom;
        }
    }

    async function stopMovingText() {
        if (userModes[2]) {
            mouseIsDown = false;
            if (controlBoxTouched) {
                const pdfLayer = await PDFDocument.create();
                pdfLayer.registerFontkit(fontkit);
                const currentText = textBox.elementToControl;
                currentText.font = await pdfLayer.embedFont(currentText.fontKey);
                let pdfCanvases = document.getElementsByClassName("render_context");
                const pageLayer = pdfLayer.addPage([pdfCanvases[textBox.page-1].width, pdfCanvases[textBox.page-1].height]);
                currentText.pdfDoc = pdfLayer;
                currentText.x = textBox.x;
                currentText.y = textBox.layer.height - textBox.y;
                currentText.setTextElem();
                const pdfLayerBytes = await pdfLayer.save();
                currentText.pdfBytes = pdfLayerBytes;
                await updateUserLayer(textBox, pdfLayerBytes);
            }
            controlBoxTouched = false;
            window.onmouseup = null;
            textBox.controlBox.onmousemove = null;
        }
    }
}


document.getElementById('applytext').addEventListener("click", async function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[3] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = async function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[3] = false;
                }
                if (userModes[3]) {
                    await applyText(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                await applyText(userTextList[index]);
            }
        }
    }
}, false);

async function applyText(controlP) {
    const pdfLayer = await PDFDocument.create();
    pdfLayer.registerFontkit(fontkit);
    const currentText = controlP.elementToControl;
    currentText.font = await pdfLayer.embedFont(currentText.fontKey);
    let pdfCanvases = document.getElementsByClassName("render_context");
    const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
    currentText.pdfDoc = pdfLayer;
    currentText.text = textarea.value.replace(/\n\r?/g, '\n');
    currentText.setTextElem();
    const pdfLayerBytes = await pdfLayer.save();
    currentText.pdfBytes = pdfLayerBytes;
    await updateUserLayer(controlP, pdfLayerBytes);
}


document.getElementById('applyfont').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[4] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[4] = false;
                }
                if (userModes[4]) {
                    applyFont(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                applyFont(userTextList[index]);
            }
        }
    }
}, false);

async function applyFont(controlP) {
    const pdfLayer = await PDFDocument.create();
    const currentText = controlP.elementToControl;
    currentText.fontKey = fontSelector.value;
    currentText.font = await pdfLayer.embedFont(fontSelector.value);
    let pdfCanvases = document.getElementsByClassName("render_context");
    const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
    currentText.pdfDoc = pdfLayer;
    currentText.setTextElem();
    const pdfLayerBytes = await pdfLayer.save();
    currentText.pdfBytes = pdfLayerBytes;
    await updateUserLayer(controlP, pdfLayerBytes);
}


document.getElementById("inputfont").addEventListener("change", function(e) {
    resetAllModes();
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => { 
            let fontAsBytes = reader.result;
            fontBytes.push(fontAsBytes);
        },
        false,
    );
    if (file) {
        reader.readAsArrayBuffer(file);
    }
    const currentFilename = file.name;
    createFileListEntryFont(currentFilename, fontBytes.length);
}, false);

function createFileListEntryFont(filename, index) {
    let originalFilename = filename;
    if (originalFilename.toLowerCase().endsWith(".ttf") || originalFilename.toLowerCase().endsWith(".otf")) {
        const container = document.getElementById("listpoint_font_con");
        const div = document.createElement("div");
        div.className = "div_files_font";
        const filelistingsFont = document.getElementsByClassName("filelisting_font");
        if (filelistingsFont.length > 0) {
            for (let i = 0; i < filelistingsFont.length; i++) {
                filelistingsFont[i].checked = false;
            }
        }
        const fileListing = document.createElement("input");
        fileListing.type = 'radio';
        fileListing.id = index + "filelist_font";
        fileListing.name = "filelist_font_radio_group";
        fileListing.value = filename;
        fileListing.className = 'filelisting_font';
        fileListing.classList.add("inner_margin");
        fileListing.checked = true;
        const label = document.createElement('label');
        label.for = index + "filelist_font";
        label.className = 'filelabel_font';
        let tempFilename = filename;
        let displayFilename = "";
        while (tempFilename.length >= 15) {
            displayFilename = displayFilename + tempFilename.substring(0, 15) + "<br />"
            tempFilename = tempFilename.substring(15, tempFilename.length);
        }
        displayFilename = displayFilename + tempFilename.substring(0, tempFilename.length);
        label.innerHTML = displayFilename;
        div.appendChild(fileListing);
        div.appendChild(label);
        container.appendChild(div);
    }
}

document.getElementById("clearlist_text").addEventListener("click", function(e) {
    clearFileList(document.getElementById("listpoint_font_con"));
    fontBytes = [];
}, false);

function clearFileList(container) {
    while(container.children.length > 0) {
        container.removeChild(container.firstChild);
    }
}


document.getElementById("applycustomfont").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[5] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[5] = false;
                }
                if (userModes[5]) {
                    applyCustomFont(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                applyCustomFont(userTextList[index]);
            }
        }
    }
}, false);

async function applyCustomFont(controlP) {
    const listedFonts = document.getElementsByClassName("filelisting_font");
    let checkedIndex;
    if (listedFonts.length > 0) {
        for (let i = 0; i < listedFonts.length; i++) {
            if (listedFonts[i].checked) {
                checkedIndex = i;
            }
        }
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        currentText.fontKey = fontBytes[checkedIndex];
        currentText.font = await pdfLayer.embedFont(fontBytes[checkedIndex]);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


fontSizeSelector.addEventListener('change', function() {
    fontSizeSelectorTriggered = true;
    fontSizeInputFieldTriggered = false;
}, false);

sizeInput.addEventListener('change', function() {
    fontSizeInputFieldTriggered = true;
    fontSizeSelectorTriggered = false;
}, false);

document.getElementById('applysize').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[6] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[6] = false;
                }
                if (userModes[6]) {
                    applyFontSize(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                applyFontSize(userTextList[index]);
            }
        }
    }
}, false);

async function applyFontSize(controlP) {
    let successValue;
    if (fontSizeSelectorTriggered) {
        successValue = convertInputToSucess(fontSizeSelector.value, 3, 500, true, false);
    } else if (fontSizeInputFieldTriggered) {
        successValue = convertInputToSucess(sizeInput.value, 3, 500, true, false);
    }
    if (successValue !== -1000) {
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        let oldSize = currentText.size;
        let changeSizeFactor = (successValue/oldSize);
        let oldLineHeight = currentText.lineHeight;
        currentText.font = await pdfLayer.embedFont(currentText.fontKey);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.size = successValue;
        currentText.lineHeight = oldLineHeight * changeSizeFactor;
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


colorPickerFont.on('change', function(color) {
    userFontColor = rgb(color.r/255, color.g/255, color.b/255);
    userFontOpacity = color.a;
}, false);

document.getElementById('applyfontcolor').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[7] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[7] = false;
                }
                if (userModes[7]) {
                    applyFontColor(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                applyFontColor(userTextList[index]);
            }
        }
    }
}, false);

async function applyFontColor(controlP) {
    const pdfLayer = await PDFDocument.create();
    pdfLayer.registerFontkit(fontkit);
    const currentText = controlP.elementToControl;
    currentText.font = await pdfLayer.embedFont(currentText.fontKey);
    let pdfCanvases = document.getElementsByClassName("render_context");
    const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
    currentText.pdfDoc = pdfLayer;
    currentText.color = userFontColor;
    currentText.opacity = userFontOpacity;
    currentText.setTextElem();
    const pdfLayerBytes = await pdfLayer.save();
    currentText.pdfBytes = pdfLayerBytes;
    await updateUserLayer(controlP, pdfLayerBytes);
}


textRotationSelector.addEventListener('change', function() {
    rotateTextSelectorTriggered = true;
    rotateTextInputFieldTriggered = false;
}, false);

textRotationInput.addEventListener('change', function() {
    rotateTextSelectorTriggered = false;
    rotateTextInputFieldTriggered = true;
}, false);

document.getElementById('applytextrotation').addEventListener('click', async function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[8] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = async function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[8] = false;
                }
                if (userModes[8]) {
                    await applyTextRotation(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                await applyTextRotation(userTextList[index]);
            }
        }
    }
}, false);

async function applyTextRotation(controlP) {
    let successValue;
    if (rotateTextSelectorTriggered) {
        successValue = convertInputToSucess(textRotationSelector.value, -360, 360, true, false);
    } else if (rotateTextInputFieldTriggered) {
        successValue = convertInputToSucess(textRotationInput.value, -360, 360, true, false);
    }
    if (successValue === 360 || successValue === -360) {
        successValue = 0;
    }
    if (successValue !== -1000) {
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        currentText.font = await pdfLayer.embedFont(currentText.fontKey);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.rotation = degrees(successValue);
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


lineheightSelector.addEventListener('change', function() {
    lineheightSelectorTriggered = true;
    lineheightInputFieldTriggered = false;
}, false);

lineheightInput.addEventListener('change', function() {
    lineheightSelectorTriggered = false;
    lineheightInputFieldTriggered = true;
}, false);

document.getElementById('applylineheight').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[9] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[9] = false;
                }
                if (userModes[9]) {
                    applyLineHeight(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                applyLineHeight(userTextList[index]);
            }
        }
    }
}, false);

async function applyLineHeight(controlP) {
    let successValue;
    if (lineheightSelectorTriggered) {
        successValue = convertInputToSucess(lineheightSelector.value, 1, 300, true, false);
    } else if (lineheightInputFieldTriggered) {
        successValue = convertInputToSucess(lineheightInput.value, 1, 300, true, false);
    }
    if (successValue !== -1000) {
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        currentText.font = await pdfLayer.embedFont(currentText.fontKey);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.lineHeight = successValue;
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


document.getElementById("cleartext").addEventListener('click', function() {
    resetAllModes();
    for (let i = userTextList.length-1; i >= 0; i--) {
        let disable = checkForLockStatus(userTextList[i].controlBox);
        if (!disable) {
            let deleteIndex = parseInt(userTextList[i].controlBox.getAttribute('data-index'), 10);
            let deletePage = parseInt(userTextList[i].controlBox.getAttribute("data-page"), 10);
            deleteText(userTextList[i].controlBox, deletePage, deleteIndex);
            deleteLayerByElement(deletePage, deleteIndex, "text");
        }
    }
}, false);