/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 2.0.0
 * @description Imager functions
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */



let userImage = {
    pdfDoc: null,
    pdfBytes: null,
    image: null,
    base64String: "",
    type: "",
    x: 1,
    y: 1,
    width: 1,
    height: 1,
    page: 1,
    opacity: 1.0,
    rotation: degrees(0),
    setImageElem() {
        this.pdfDoc.getPages()[0].drawImage(this.image, {
           x: this.x,
           y: this.y,
           width: this.width,
           height: this.height,
           rotate: this.rotation,
        });
    }
}

let imageControllerPointCounter = 0;
let rotateImgSelectorTriggered = false;
let rotateImgInputFieldTriggered = false;
const scaleInputFieldImgWidth = document.getElementById("scale_width_img");
const scaleInputFieldImgHeight = document.getElementById("scale_height_img");
const imgRotationSelector = document.getElementById("rotateimgsel");
const imgRotationInput = document.getElementById("imgrotation_input");


document.getElementById("inputimg").addEventListener("change", function(e) {
    resetAllModes();
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
            let imageBase64 = reader.result;
            imagesBase64Strings.push(imageBase64);
        },
        false,
    );

    if (file) {
        reader.readAsDataURL(file);
    }
    
    const currentFilename = file.name;
    createFileListEntryImage(currentFilename, imagesBase64Strings.length);
}, false);

function createFileListEntryImage(filename, index) {
    let originalFilename = filename;
    if (originalFilename.toLowerCase().endsWith(".jpg") || originalFilename.toLowerCase().endsWith(".jpeg") || originalFilename.toLowerCase().endsWith(".png")) {
        const container = document.getElementById("listpoint_img_con");
        const div = document.createElement("div");
        div.className = "div_files_img";
        const filelistingsImg = document.getElementsByClassName("filelisting_img");
        if (filelistingsImg.length > 0) {
            for (let i = 0; i < filelistingsImg.length; i++) {
                filelistingsImg[i].checked = false;
            }
        }
        const fileListing = document.createElement("input");
        fileListing.type = 'radio';
        fileListing.id = index + "filelist_img";
        fileListing.name = "filelist_img_radio_group";
        fileListing.value = filename;
        fileListing.className = 'filelisting_img';
        fileListing.classList.add("inner_margin");
        fileListing.checked = true;
        const label = document.createElement('label');
        label.for = index + "filelist_img";
        label.className = 'filelabel_img';
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
        const dimensions = document.createElement("div");
        dimensions.className = "flexrow"
        const dimFontCon = document.createElement("div");
        dimFontCon.className = "flexcol";
        dimFontCon.classList.add("inner_margin");
        const labelOutputW = document.createElement('label');
        labelOutputW.for = 'img_dim_width';
        labelOutputW.innerHTML = "Original Width: ";
        const labelOutputH = document.createElement('label');
        labelOutputH.for = 'img_dim_height';
        labelOutputH.innerHTML = "Original Height: ";
        dimFontCon.appendChild(labelOutputW);
        dimFontCon.appendChild(labelOutputH);
        const dimsCon = document.createElement("div");
        dimsCon.className = "flexcol";
        const outputWidth = document.createElement('output');
        outputWidth.className = 'img_dim_width';
        outputWidth.classList.add('margin_bottom');
        const outputHeight = document.createElement('output');
        outputHeight.className = 'img_dim_height';
        dimsCon.appendChild(outputWidth);
        dimsCon.appendChild(outputHeight);
        dimensions.appendChild(dimFontCon);
        dimensions.appendChild(dimsCon);
        container.appendChild(dimensions);
    }
}

document.getElementById("clearlist_img").addEventListener("click", function(e) {
    clearFileList(document.getElementById("listpoint_img_con"));
    imagesBase64Strings = [];
}, false);


document.getElementById('addimg').addEventListener("click", function(e) {
    resetAllModes();
    userModesImages[0] = true;
    for(let i = 0; i < writeLayerStack.length; i++) {
        writeLayerStack[i].onclick = async function(e) {
            await addImage(e, writeLayerStack[i]);
        }
    }
}, false);

async function addImage(e, writeLayer) {
    if (userModesImages[0]) {
        const currentUserImage = Object.create(userImage);
        const controlP = Object.create(controlPoint);
        const pdfLayer = await PDFDocument.create();
        let rect = writeLayer.getBoundingClientRect();
        let mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        let writePage = parseInt(writeLayer.getAttribute("data-write"), 10);
        const listedImages = document.getElementsByClassName("filelisting_img");
        let checkedIndex;
        if (listedImages.length > 0) {
            for (let i = 0; i < listedImages.length; i++) {
                if (listedImages[i].checked) {
                    checkedIndex = i;
                }
            }
            let imgBytes;
            const label = document.getElementsByClassName("filelabel_img");
            let labelName = label[checkedIndex].innerHTML;
            while (labelName.search("<br>") > -1) {
                labelName = labelName.replace("<br>", "");
            }
            let checkLabelname = labelName;
            if (checkLabelname.toLowerCase().endsWith(".png")) {
                currentUserImage.type = 'png';
                imgBytes = await pdfLayer.embedPng(imagesBase64Strings[checkedIndex]);
            } else if (checkLabelname.toLowerCase().endsWith(".jpg") || checkLabelname.toLowerCase().endsWith(".jpeg")) {
                currentUserImage.type = 'jpg';
                imgBytes = await pdfLayer.embedJpg(imagesBase64Strings[checkedIndex]);
            }
            pdfLayer.addPage([writeLayer.width, writeLayer.height]);
            currentUserImage.pdfDoc = pdfLayer;
            currentUserImage.image = imgBytes;
            currentUserImage.base64String = imagesBase64Strings[checkedIndex];
            currentUserImage.x = mousePos.x / pdfState.zoom;
            currentUserImage.y = writeLayer.height - mousePos.y / pdfState.zoom;
            currentUserImage.width = imgBytes.width;
            currentUserImage.height = imgBytes.height;
            const imgDimOutputW = document.getElementsByClassName("img_dim_width");
            imgDimOutputW[checkedIndex].innerHTML = imgBytes.width;
            const imgDimOutputH = document.getElementsByClassName("img_dim_height");
            imgDimOutputH[checkedIndex].innerHTML = imgBytes.height;
            currentUserImage.page = writePage;
            currentUserImage.opacity = 1.0;
            currentUserImage.rotation = degrees(0);
            currentUserImage.setImageElem();
            const pdfLayerBytes = await pdfLayer.save();
            currentUserImage.pdfBytes = pdfLayerBytes;
            controlP.x = mousePos.x;
            controlP.y = mousePos.y;
            controlP.elementToControl = currentUserImage;
            controlP.type = "image";
            controlP.layer = writeLayer;
            controlP.page = writePage;
            controlP.index = imageControllerPointCounter;
            imageControllerPointCounter++;
            controlP.setControlPoint();
            controlP.x = mousePos.x/pdfState.zoom;
            controlP.y = mousePos.y/pdfState.zoom;
            const canvasContainer = createUserLayer("image", writePage, controlP, writeLayer, pdfLayerBytes);
            controlP.editImg = canvasContainer;
            userImageList.push(controlP);
        }
    }
}

function createUserLayer(editImgClass, thisPage, controlP, writeLayer, pdfLayerBytes) {
    let controlGroupDiv;
    if (writeLayer.querySelectorAll("div.control_group").length == 0) {
        controlGroupDiv = document.createElement("div");
        controlGroupDiv.style.position = "absolute";
        controlGroupDiv.style.top = 0;
        controlGroupDiv.setAttribute('data-page', thisPage);
        controlGroupDiv.classList.add("control_group");
        writeLayer.appendChild(controlGroupDiv);
    }
    writeLayer.querySelectorAll("div.control_group")[0].appendChild(controlP.controlBox);
    let pdfCanvases = document.getElementsByClassName("render_context");
    const canvasContainer = document.createElement("canvas");
    canvasContainer.style.display = "flex";
    canvasContainer.style.position = "absolute";
    canvasContainer.style.top = 0;
    canvasContainer.width = pdfCanvases[thisPage-1].width;
    canvasContainer.height = pdfCanvases[thisPage-1].height;
    canvasContainer.style.width = pdfCanvases[thisPage-1].width + "px";
    canvasContainer.style.height = pdfCanvases[thisPage-1].height + "px";
    canvasContainer.setAttribute('data-page', thisPage);
    canvasContainer.setAttribute('data-index', controlP.index);
    canvasContainer.classList.add("editimg");
    canvasContainer.classList.add(editImgClass);
    canvasContainer.classList.add("visible");
    const ctx = canvasContainer.getContext('2d');
    const loadingTask = pdfjsLib.getDocument(pdfLayerBytes);
    loadingTask.promise.then(pdf => {
        pdf.getPage(1).then(function(page) {
            const viewport = page.getViewport({
                scale: pdfState.zoom
            });

            const renderContext = { 
                canvasContext: ctx, 
                background: 'rgba(0,0,0,0)',
                viewport: viewport 
            };
            page.render(renderContext).promise.then(async () => {
                let editimgGroupDiv;
                if (writeLayer.querySelectorAll("div.editimg_group").length == 0) {
                    editimgGroupDiv = document.createElement("div");
                    editimgGroupDiv.style.position = "absolute";
                    editimgGroupDiv.style.top = 0;
                    editimgGroupDiv.setAttribute('data-page', thisPage);
                    editimgGroupDiv.classList.add("editimg_group");
                    writeLayer.insertBefore(editimgGroupDiv, writeLayer.children[1]);
                }
                writeLayer.querySelectorAll("div.editimg_group")[0].appendChild(canvasContainer);
                createStackLayer(thisPage, editImgClass, controlP.index);
            });
        });
    });
    return canvasContainer;
}


async function updateUserLayer(controlP, pdfLayerBytes) {
    const pdfCanvases = document.getElementsByClassName("render_context");
    const ctx = controlP.editImg.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const loadingTask = pdfjsLib.getDocument(pdfLayerBytes);
    loadingTask.promise.then(pdf => {
        pdf.getPage(1).then(function(page) {
            const viewport = page.getViewport({
                scale: pdfState.zoom
            });
            const renderContext = { 
                canvasContext: ctx, 
                background: 'rgba(0,0,0,0)',
                viewport: viewport 
            };
            page.render(renderContext).promise.then(async () => {
                const currentEditElement = controlP.elementToControl;
                if (currentEditElement.opacity < 1.0) {
                    let screenData = ctx.getImageData(0, 0, pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height);
                    for(let i = 3; i < screenData.data.length; i+=4) {
                        screenData.data[i] = currentEditElement.opacity * screenData.data[i];
                    }
                    ctx.putImageData(screenData, 0, 0);
                }
            });   
        });
    });
}


document.getElementById('scaleimg').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesImages[3] = true;
        for (let i = 0; i < userImageList.length; i++) {
            userImageList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(userImageList[i].controlBox);
                if (disable) {
                    userModesImages[3] = false;
                }
                if (userModesImages[3]) {
                    scaleImage(userImageList[i]);
                    markSingleLayerOnEdit(userImageList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "image") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                scaleImage(userImageList[index]);
            }
        }
    }
}, false);

async function scaleImage(controlP) {
    let successValueW = convertInputToSucess(scaleInputFieldImgWidth.value, 1, 3000, true, false);
    let successValueH = convertInputToSucess(scaleInputFieldImgHeight.value, 1, 3000, true, false);
    if (successValueW !== -1000 && successValueH !== -1000) {
        const pdfLayer = await PDFDocument.create();
        const currentImage = controlP.elementToControl;
        let imgBytes;
        if (currentImage.type === 'png') {
            imgBytes = await pdfLayer.embedPng(currentImage.base64String);
        } else if (currentImage.type === 'jpg') {
            imgBytes = await pdfLayer.embedJpg(currentImage.base64String);
        }
        let pdfCanvases = document.getElementsByClassName("render_context");
        pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentImage.pdfDoc = pdfLayer;
        currentImage.image = imgBytes;
        currentImage.width = successValueW * pdfState.zoom;
        currentImage.height = successValueH * pdfState.zoom;
        currentImage.setImageElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentImage.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);  
    }
}


const scaleByFactorImg = document.getElementById("scale_factor_img");

document.getElementById('applyscale').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesImages[4] = true;
        for (let i = 0; i < userImageList.length; i++) {
            userImageList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(userImageList[i].controlBox);
                if (disable) {
                    userModesImages[4] = false;
                }
                if (userModesImages[4]) {
                    scaleImageByFactor(userImageList[i]);
                    markSingleLayerOnEdit(userImageList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "image") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                scaleImageByFactor(userImageList[index]);
            }
        }
    }
}, false);

async function scaleImageByFactor(controlP) {
    let successValue = convertInputToSucess(scaleByFactorImg.value, 0.1, 20, false, true);
    if (successValue !== -1000) {
        const pdfLayer = await PDFDocument.create();
        const currentImage = controlP.elementToControl;
        let imgBytes;
        if (currentImage.type === 'png') {
            imgBytes = await pdfLayer.embedPng(currentImage.base64String);
        } else if (currentImage.type === 'jpg') {
            imgBytes = await pdfLayer.embedJpg(currentImage.base64String);
        }
        let pdfCanvases = document.getElementsByClassName("render_context");
        pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentImage.pdfDoc = pdfLayer;
        currentImage.image = imgBytes;
        currentImage.width = currentImage.width * successValue;
        currentImage.height = currentImage.height * successValue;
        currentImage.setImageElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentImage.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes); 
    }
}


const imgOpacityInput =  document.getElementById("img_opacity");

document.getElementById('applyopacity').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesImages[5] = true;
        for (let i = 0; i < userImageList.length; i++) {
            userImageList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(userImageList[i].controlBox);
                if (disable) {
                    userModesImages[5] = false;
                }
                if (userModesImages[5]) {
                    applyImgOpacity(userImageList[i]);
                    markSingleLayerOnEdit(userImageList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "image") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                applyImgOpacity(userImageList[index]);
            }
        }
    }
}, false);

async function applyImgOpacity(controlP) {
    let successValue = convertInputToSucess(imgOpacityInput.value, 0.01, 1, false, true);
    if (successValue !== -1000) {
        const pdfLayer = await PDFDocument.create();
        const currentImage = controlP.elementToControl;
        let imgBytes;
        if (currentImage.type === 'png') {
            imgBytes = await pdfLayer.embedPng(currentImage.base64String);
        } else if (currentImage.type === 'jpg') {
            imgBytes = await pdfLayer.embedJpg(currentImage.base64String);
        }
        let pdfCanvases = document.getElementsByClassName("render_context");
        pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentImage.pdfDoc = pdfLayer;
        currentImage.image = imgBytes;
        currentImage.opacity = successValue;
        currentImage.setImageElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentImage.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);  
    }
}


imgRotationSelector.addEventListener('change', function() {
    rotateImgSelectorTriggered = true;
    rotateImgInputFieldTriggered = false;
}, false);

imgRotationInput.addEventListener('change', function() {
    rotateImgSelectorTriggered = false;
    rotateImgInputFieldTriggered = true;
}, false);

document.getElementById('applyimgrotation').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesImages[6] = true;
        for (let i = 0; i < userImageList.length; i++) {
            userImageList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(userImageList[i].controlBox);
                if (disable) {
                    userModesImages[6] = false;
                }
                if (userModesImages[6]) {
                    applyImgRotation(userImageList[i]);
                    markSingleLayerOnEdit(userImageList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "image") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                applyImgRotation(userImageList[index]);
            }
        }
    }
}, false);

async function applyImgRotation(controlP) {
    let successValue;
    if (rotateImgSelectorTriggered) {
        successValue = convertInputToSucess(imgRotationSelector.value, -360, 360, true, false);
    } else if (rotateImgInputFieldTriggered) {
        successValue = convertInputToSucess(imgRotationInput.value, -360, 360, true, false);
    }
    if (successValue === 360 || successValue === -360) {
        successValue = 0;
    }
    if (successValue !== -1000) {
        const pdfLayer = await PDFDocument.create();
        const currentImage = controlP.elementToControl;
        let imgBytes;
        if (currentImage.type === 'png') {
            imgBytes = await pdfLayer.embedPng(currentImage.base64String);
        } else if (currentImage.type === 'jpg') {
            imgBytes = await pdfLayer.embedJpg(currentImage.base64String);
        }
        let pdfCanvases = document.getElementsByClassName("render_context");
        pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentImage.pdfDoc = pdfLayer;
        currentImage.image = imgBytes;
        currentImage.rotation = degrees(successValue); 
        currentImage.setImageElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentImage.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes); 
    }
}