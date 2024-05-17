/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 2.0.0
 * @description Layer operations: creation, copy, delete, move, lock, order, selection, hiding
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */



let firstStackLayer = true;
let layerNameCounterText = 1;
let layerNameCounterShape = 1;
let layerNameCounterDrawing = 1;
let layerNameCounterImage = 1;
let layerApplyMode = false;
let boxApplyMode = true;
let copyCounter = 1;
let controlBoxTouched = false;


const btns = document.getElementById("btns");
btns.addEventListener("click", function() {
    resetAllModes();
    const layerStackWrappers = document.getElementsByClassName("layer_stack_wrapper");
    if(document.getElementById("show_btns").style.display === "none") {
        document.getElementById("show_btns").style.flexDirection = "column";
        document.getElementById("show_btns").style.display = "flex";
        for (let i = 0; i < layerStackWrappers.length; i++) {
            layerStackWrappers[i].style.paddingTop = "260px";
        }
    } else if (document.getElementById("show_btns").style.display === "flex") {
        document.getElementById("show_btns").style.display = "none";
        for (let i = 0; i < layerStackWrappers.length; i++) {
            layerStackWrappers[i].style.paddingTop = "50px"; 
        }
    }
}, false);

const showSidemenuBtns = document.getElementsByClassName("showsidemenu");
for (let i = 0; i < showSidemenuBtns.length; i++) {
    showSidemenuBtns[i].addEventListener("click", function() {
        resetAllModes();
        if (sidemenuVisible) {
            sidemenuVisible = false;
            const sidemenus = document.getElementsByClassName("sidemenu");
            for (let i = 0; i < sidemenus.length; i++) {
                sidemenus[i].style.display = "none";
            }
            if (document.getElementById("layer_stack").style.display === "flex") {
                document.getElementById("layer_stack").style.right = "0";
            }
        } else {
            sidemenuVisible = true;
            const sidemenus = document.getElementsByClassName("sidemenu");
            for (let i = 0; i < sidemenus.length; i++) {
                sidemenus[i].style.display = "flex";
            }
            document.getElementById("layer_stack").style.right = "40%";
        }
    }, false);
}

const showLayersBtns = document.getElementsByClassName("layers");
for (let i = 0; i < showLayersBtns.length; i++) {
    showLayersBtns[i].addEventListener("click", function() {
        resetAllModes();
        if (layersVisible) {
            layersVisible = false;
            document.getElementById("layer_stack").style.display = "none";
        } else {
            layersVisible = true;
            document.getElementById("layer_stack").style.display = "flex";
            if (document.getElementById("sidemenu").style.display === "none") {
                document.getElementById("layer_stack").style.right = "0";
            }
        }
    }, false);
}


const layerModeBtn = document.getElementById("layer_mode");
layerModeBtn.addEventListener('click', function() {
    resetAllModes();
    layerApplyMode = true;
    boxApplyMode = false;
    layerModeBtn.classList.add("btn-success");
    layerModeBtn.classList.remove('btn-light');
    boxModeBtn.classList.remove("btn-success");
    boxModeBtn.classList.add('btn-light');
}, false);

const boxModeBtn = document.getElementById("box_mode");
boxModeBtn.addEventListener('click', function() {
    resetAllModes();
    layerApplyMode = false;
    boxApplyMode = true;
    boxModeBtn.classList.add("btn-success");
    boxModeBtn.classList.remove('btn-light');
    layerModeBtn.classList.remove("btn-success");
    layerModeBtn.classList.add('btn-light');
}, false);


function createStackLayer(thisPage, editImgClass, editImgIndex) {
    if (firstStackLayer) {
        firstStackLayer = false;
        selAll.disabled = false;
        unselAll.disabled = false;
        document.getElementsByClassName("selall_hover_disabled")[0].classList.add("selall_hover");
        document.getElementsByClassName("deselall_hover_disabled")[0].classList.add("deselall_hover");
    }
    const layerStack = document.getElementById("layer_stack_con");
    const pageLabels = layerStack.getElementsByClassName("layerlabel");
    let newPage = true;
    if (pageLabels.length > 0) {
        for (let i = 0; i < pageLabels.length; i++) {
            let label = pageLabels[i];
            let labelPage = parseInt(label.getAttribute("data-page"), 10);
            if (labelPage != thisPage) {
                newPage = true;
            } else {
                newPage = false;
                break;
            }
        }
    }
    let pageLabel;
    if (newPage) {
        pageLabel = document.createElement("div");
        pageLabel.innerHTML = "Page " + thisPage;
        pageLabel.setAttribute('data-page', thisPage);
        pageLabel.classList.add("layerlabel");
    } else {
        for (let i = 0; i < pageLabels.length; i++) {
            if (parseInt(pageLabels[i].getAttribute("data-page"), 10) === thisPage) {
                pageLabel = pageLabels[i];
            }
        }
    }
    const layerCon = document.createElement("div");
    layerCon.classList.add("layercontainer");
    layerCon.classList.add("layer_unselected");
    layerCon.classList.add("unlocked");
    layerCon.setAttribute('data-page', thisPage);
    layerCon.setAttribute('data-index', editImgIndex);
    layerCon.setAttribute('data-type', editImgClass);
    const eyeLabel = document.createElement("label");
    eyeLabel.style.width = "25px";
    eyeLabel.style.height = "25px";
    eyeLabel.setAttribute('data-index', editImgIndex);
    eyeLabel.setAttribute('data-page', thisPage);
    eyeLabel.setAttribute('data-type', editImgClass);
    const layerEye = document.createElement("input");
    layerEye.type = "checkbox";
    layerEye.className = "layercheckbox";
    layerEye.name = "layercheckbox";
    layerEye.value = "isVisible";
    layerEye.checked = true;
    layerEye.setAttribute('data-index', editImgIndex);
    layerEye.setAttribute('data-page', thisPage);
    layerEye.setAttribute('data-type', editImgClass);
    layerEye.addEventListener("input", function() {
        hideLayer(layerEye);
    }, false);
    const layerName = document.createElement("input");
    layerName.type = "text";
    layerName.className = "layername";
    layerName.name = "layername";
    if (editImgClass === "text") {
        layerName.value = editImgClass + layerNameCounterText;
        layerNameCounterText++;
    } else if (editImgClass === "shape") {
        layerName.value = editImgClass + layerNameCounterShape;
        layerNameCounterShape++;
    } else if (editImgClass === "drawing") {
        layerName.value = editImgClass + layerNameCounterDrawing;
        layerNameCounterDrawing++;
    } else if (editImgClass === "image") {
        layerName.value = editImgClass + layerNameCounterImage;
        layerNameCounterImage++;
    }
    layerName.setAttribute('data-page', thisPage);
    layerName.setAttribute('data-index', editImgIndex);
    layerName.setAttribute('data-type', editImgClass);
    layerName.addEventListener("click", function() {
        markLayer(layerName); 
    }, false);
    eyeLabel.appendChild(layerEye);
    layerCon.appendChild(eyeLabel);
    layerCon.appendChild(layerName);  
    pageLabel.appendChild(layerCon);
    if (newPage) {
        let newPageGroupIndex = thisPage - 1;
        if (layerStack.children.length === 0) {
            layerStack.appendChild(pageLabel);
        } else if (layerStack.children.length === 1) {
            let pageGroupIndex = parseInt(layerStack.children[0].getAttribute("data-page"), 10) - 1;
            if (newPageGroupIndex < pageGroupIndex) {
                layerStack.insertBefore(pageLabel, layerStack.children[0]);
            } else if (newPageGroupIndex > pageGroupIndex) {
                layerStack.appendChild(pageLabel);
            }
        } else if (layerStack.children.length > 1) {
            for (let i = 0; i < layerStack.children.length - 1; i++) {
                let lowerPageGroup = layerStack.children[i];
                let upperPageGroup = layerStack.children[i+1];
                let lowerPageGroupIndex = parseInt(lowerPageGroup.getAttribute("data-page"), 10) - 1;
                let upperPageGroupIndex = parseInt(upperPageGroup.getAttribute("data-page"), 10) - 1;
                if (newPageGroupIndex < lowerPageGroupIndex) {
                    layerStack.insertBefore(pageLabel, layerStack.children[0]);
                    break;
                } else if (newPageGroupIndex > lowerPageGroupIndex && newPageGroupIndex < upperPageGroupIndex) {
                    let positionIndex = Array.prototype.indexOf.call(layerStack.children, upperPageGroup);
                    layerStack.insertBefore(pageLabel, layerStack.children[positionIndex]);
                    break
                } else if (newPageGroupIndex > upperPageGroupIndex) {
                    layerStack.appendChild(pageLabel);
                }
            }
        }
    }
    markSingleLayer(layerName);
    moveLayer(layerStack);
}


function deleteLayer() {
    let layercontainers = document.getElementsByClassName("layercontainer");
    let layerconsToDelete = [...layercontainers];
    let deleteIndex;
    let deleteType;
    let deletePage;
    for (let i = 0; i < layerconsToDelete.length; i++) {
        if (layerconsToDelete[i].classList.contains("layer_selected") && layerconsToDelete[i].classList.contains("unlocked")) {
            deletePage = parseInt(layerconsToDelete[i].getAttribute("data-page"), 10);
            deleteIndex = parseInt(layerconsToDelete[i].getAttribute("data-index"), 10);
            deleteType = layerconsToDelete[i].getAttribute("data-type");
            deleteLayerByElement(deletePage, deleteIndex, deleteType);
            deleteElement(deletePage, deleteIndex, deleteType);
        }
    }
}

function deleteLayerByElement(page, index, type) {
    let layercontainers = document.getElementsByClassName("layercontainer");
    let layerContainerToDelete;
    for (let i = 0; i < layercontainers.length; i++) {
        if (parseInt(layercontainers[i].getAttribute("data-page"), 10) === page && parseInt(layercontainers[i].getAttribute("data-index"), 10) === index && layercontainers[i].getAttribute("data-type") === type) {
            layerContainerToDelete = layercontainers[i];
        }
    }
    const layerLabel = layerContainerToDelete.parentNode;
    layerLabel.removeChild(layerContainerToDelete);
    if (layerLabel.children.length === 0) {
        layerLabel.parentNode.removeChild(layerLabel);
    }
    layercontainers = document.getElementsByClassName("layercontainer");
    for (let i = 0; i < layercontainers.length; i++) {
        if (parseInt(layercontainers[i].getAttribute("data-index"), 10) > index && layercontainers[i].getAttribute("data-type") === type) {
            layercontainers[i].dataset.index -= 1;
            layercontainers[i].children[0].dataset.index -= 1;
            layercontainers[i].children[0].children[0].dataset.index -= 1;
            layercontainers[i].children[1].dataset.index -= 1;
        }
    } 
    if (userTextList.length === 0) {
        layerNameCounterText = 1;
    }
    if (drawLayerStack.length === 0) {
        layerNameCounterDrawing = 1;
    }
    if (geometryPointsList.length === 0) {
        layerNameCounterShape = 1;
    }
    if (userImageList.length === 0) {
        layerNameCounterImage = 1;
    }
    const layerstack = document.getElementById("layer_stack_con");
    if (layerstack.children.length === 0) {
        copyCounter = 1;
        selAll.disabled = true;
        unselAll.disabled = true;
        document.getElementsByClassName("selall_hover_disabled")[0].classList.remove("selall_hover");
        document.getElementsByClassName("deselall_hover_disabled")[0].classList.remove("deselall_hover");
        firstStackLayer = true;
    }
}


document.getElementById("dublicatelayer").addEventListener("click", dublicateLayer, false);

async function dublicateLayer() {
    resetAllModes();
    let layercontainers = document.getElementsByClassName("layercontainer");
    let dublicateType;
    let dublicatePage;
    let index;
    for (let i = 0; i < layercontainers.length; i++) {
        if (layercontainers[i].classList.contains("layer_selected")) {
            dublicatePage = parseInt(layercontainers[i].getAttribute("data-page"), 10);
            index = parseInt(layercontainers[i].getAttribute("data-index"), 10);
            dublicateType = layercontainers[i].getAttribute("data-type");
            dublicateLayerByElement(dublicatePage, index, dublicateType);
            await dublicateElement(dublicatePage, index, dublicateType);
        }
    }
}

function dublicateLayerByElement(page, index, type) {
    let layercontainers = document.getElementsByClassName("layercontainer");
    let layerContainerToDublicate;
    for (let i = 0; i < layercontainers.length; i++) {
        if (parseInt(layercontainers[i].getAttribute("data-page"), 10) === page && parseInt(layercontainers[i].getAttribute("data-index"), 10) === index && layercontainers[i].getAttribute("data-type") === type) {
            layerContainerToDublicate = layercontainers[i];
        }
    }
    const dublicateLayercontainer = layerContainerToDublicate.cloneNode(true);
    dublicateLayercontainer.classList.remove("layer_selected");
    dublicateLayercontainer.classList.add("layer_unselected");
    dublicateLayercontainer.style.borderStyle = "none";
    if (dublicateLayercontainer.classList.contains("unlocked")) {
        dublicateLayercontainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    } else if (dublicateLayercontainer.classList.contains("locked")) {
        dublicateLayercontainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    }
    let layerlabel = dublicateLayercontainer.children[0];
    let layerEye = dublicateLayercontainer.children[0].children[0];
    let layername = dublicateLayercontainer.children[1];
    layername.value = layername.value + "copy" + copyCounter;
    copyCounter++;
    if (type === "text") {
        dublicateLayercontainer.setAttribute("data-index", textControllerPointCounter);
        layerlabel.setAttribute("data-index",  textControllerPointCounter);
        layerEye.setAttribute("data-index",  textControllerPointCounter);
        layername.setAttribute("data-index",  textControllerPointCounter);
    } else if (type === "shape") {
        dublicateLayercontainer.setAttribute("data-index", shapeControllerPointCounter);
        layerlabel.setAttribute("data-index",  shapeControllerPointCounter);
        layerEye.setAttribute("data-index",  shapeControllerPointCounter);
        layername.setAttribute("data-index",  shapeControllerPointCounter);
    } else if (type === "drawing") {
        dublicateLayercontainer.setAttribute("data-index", drawControllerPointCounter);
        layerlabel.setAttribute("data-index", drawControllerPointCounter);
        layerEye.setAttribute("data-index", drawControllerPointCounter);
        layername.setAttribute("data-index", drawControllerPointCounter);
    } else if (type === "image") {
        dublicateLayercontainer.setAttribute("data-index", imageControllerPointCounter);
        layerlabel.setAttribute("data-index", imageControllerPointCounter);
        layerEye.setAttribute("data-index", imageControllerPointCounter);
        layername.setAttribute("data-index", imageControllerPointCounter);
    }
    layerContainerToDublicate.parentNode.insertBefore(dublicateLayercontainer, layerContainerToDublicate.nextSibling);
    layerEye.addEventListener("input", function() {
        hideLayer(layerEye); 
    });
    layername.addEventListener("click", function() {
        markLayer(layername); 
    });
    const layerStack = document.getElementById("layer_stack_con");
    moveLayer(layerStack);
}  

async function dublicateElement(thisPage, index, type) {
    if (type === "image") {
        const elementToDublicate = userImageList[index];
        const imageToDublicate = elementToDublicate.elementToControl;
        const currentUserImage = Object.create(userImage);
        const controlP = Object.create(controlPoint);
        const pdfCanvases = document.getElementsByClassName("render_context");
        const pdfLayer = await PDFDocument.create();
        let imgBytes;
        if (imageToDublicate.type === 'png') {
            currentUserImage.type = 'png';
            currentUserImage.base64String = imageToDublicate.base64String;
            imgBytes = await pdfLayer.embedPng(currentUserImage.base64String);
        } else if (imageToDublicate.type === 'jpg') {
            currentUserImage.type = 'jpg';
            currentUserImage.base64String = imageToDublicate.base64String;
            imgBytes = await pdfLayer.embedJpg(currentUserImage.base64String);
        }
        const pageLayer = pdfLayer.addPage([pdfCanvases[thisPage-1].width, pdfCanvases[thisPage-1].height]);
        currentUserImage.pdfDoc = pdfLayer;
        currentUserImage.image = imgBytes;
        currentUserImage.x = elementToDublicate.x;
        currentUserImage.y = elementToDublicate.layer.height - elementToDublicate.y;
        currentUserImage.width = imageToDublicate.width;
        currentUserImage.height = imageToDublicate.height;
        currentUserImage.page = imageToDublicate.page;
        currentUserImage.opacity = imageToDublicate.opacity;
        currentUserImage.rotation = imageToDublicate.rotation;
        currentUserImage.setImageElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentUserImage.pdfBytes = pdfLayerBytes;
        let origX = elementToDublicate.x;
        let origY = elementToDublicate.y;
        controlP.x = elementToDublicate.x * pdfState.zoom;
        controlP.y = elementToDublicate.y * pdfState.zoom;
        controlP.elementToControl = currentUserImage;
        controlP.type = "image";
        controlP.layer = elementToDublicate.layer;
        controlP.page = elementToDublicate.page;
        controlP.index = imageControllerPointCounter;
        controlP.setControlPoint();
        controlP.x = origX;
        controlP.y = origY;
        userImageList.push(controlP);
        const canvasToDublicate = elementToDublicate.editImg;
        const canvasContainer = document.createElement("canvas");
        canvasContainer.style.display = "flex";
        canvasContainer.style.position = "absolute";
        canvasContainer.style.top = 0;
        canvasContainer.width = pdfCanvases[thisPage-1].width;
        canvasContainer.height = pdfCanvases[thisPage-1].height;
        canvasContainer.setAttribute('data-page', controlP.page);
        canvasContainer.setAttribute('data-index', imageControllerPointCounter);
        imageControllerPointCounter++;
        canvasContainer.classList.add("editimg");
        canvasContainer.classList.add("image");
        canvasContainer.classList.add(canvasToDublicate.classList.item(2));
        controlP.editImg = canvasContainer;
        await updateUserLayer(controlP, pdfLayerBytes);
        elementToDublicate.controlBox.parentNode.insertBefore(controlP.controlBox, elementToDublicate.controlBox.nextSibling);
        elementToDublicate.editImg.parentNode.insertBefore(controlP.editImg, elementToDublicate.editImg.nextSibling);
    } else if (type === "text") {
        const elementToDublicate = userTextList[index];
        const textToDublicate = elementToDublicate.elementToControl;
        const currentUserText = Object.create(userText);
        const controlP = Object.create(controlPoint);
        const pdfCanvases = document.getElementsByClassName("render_context");
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const font = await pdfLayer.embedFont(textToDublicate.fontKey);
        const pageLayer = pdfLayer.addPage([pdfCanvases[thisPage-1].width, pdfCanvases[thisPage-1].height]);
        currentUserText.pdfDoc = pdfLayer;
        currentUserText.text = textToDublicate.text;
        currentUserText.x = elementToDublicate.x;
        currentUserText.y = elementToDublicate.layer.height - elementToDublicate.y;
        currentUserText.size = textToDublicate.size;
        currentUserText.fontKey = textToDublicate.fontKey;
        currentUserText.font = font;
        currentUserText.lineHeight = textToDublicate.lineHeight;
        currentUserText.color = textToDublicate.color;
        currentUserText.page = textToDublicate.page;
        currentUserText.opacity = textToDublicate.opacity;
        currentUserText.rotation = textToDublicate.rotation;
        currentUserText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentUserText.pdfBytes = pdfLayerBytes;
        let origX = elementToDublicate.x;
        let origY = elementToDublicate.y;
        controlP.x = elementToDublicate.x * pdfState.zoom;
        controlP.y = elementToDublicate.y * pdfState.zoom;
        controlP.elementToControl = currentUserText;
        controlP.type = "text";
        controlP.layer = elementToDublicate.layer;
        controlP.page = elementToDublicate.page;
        controlP.index = textControllerPointCounter;
        controlP.setControlPoint();
        controlP.x = origX;
        controlP.y = origY;
        userTextList.push(controlP);
        const canvasToDublicate = elementToDublicate.editImg;
        const canvasContainer = document.createElement("canvas");
        canvasContainer.style.display = "flex";
        canvasContainer.style.position = "absolute";
        canvasContainer.style.top = 0;
        canvasContainer.width = pdfCanvases[thisPage-1].width;
        canvasContainer.height = pdfCanvases[thisPage-1].height;
        canvasContainer.setAttribute('data-page', controlP.page);
        canvasContainer.setAttribute('data-index', textControllerPointCounter);
        textControllerPointCounter++;
        canvasContainer.classList.add("editimg");
        canvasContainer.classList.add("text");
        canvasContainer.classList.add(canvasToDublicate.classList.item(2));
        controlP.editImg = canvasContainer;
        await updateUserLayer(controlP, pdfLayerBytes);
        elementToDublicate.controlBox.parentNode.insertBefore(controlP.controlBox, elementToDublicate.controlBox.nextSibling);
        elementToDublicate.editImg.parentNode.insertBefore(controlP.editImg, elementToDublicate.editImg.nextSibling);
    } else if (type === "drawing") {
        const elementToDublicate = drawLayerStack[index];
        const drawingLayerToDublicate = elementToDublicate.elementToControl;
        let pdfCanvases = document.getElementsByClassName("render_context");
        const drawingLayer = Object.create(drawLayer);
        const controlP = Object.create(controlPoint);
        drawingLayer.paths = deepCopy(drawingLayerToDublicate.paths);
        drawingLayer.currentPathIndex = drawingLayerToDublicate.currentPathIndex;
        drawingLayer.rotation = drawingLayerToDublicate.rotation;
        const canvasToDublicate = elementToDublicate.editImg;
        const canvasContainer = document.createElement("canvas");
        canvasContainer.style.display = "flex";
        canvasContainer.style.position = "absolute";
        canvasContainer.style.top = 0;
        canvasContainer.width = pdfCanvases[thisPage-1].width;
        canvasContainer.height = pdfCanvases[thisPage-1].height;
        canvasContainer.setAttribute('data-page', thisPage);
        canvasContainer.setAttribute('data-index', drawControllerPointCounter);
        canvasContainer.classList.add("editimg");
        canvasContainer.classList.add("drawing");
        canvasContainer.classList.add(canvasToDublicate.classList.item(2));
        controlP.editImg = canvasContainer;
        let origX = elementToDublicate.x;
        let origY = elementToDublicate.y;
        controlP.x = elementToDublicate.x * pdfState.zoom;
        controlP.y = elementToDublicate.y * pdfState.zoom;
        controlP.elementToControl = drawingLayer;
        controlP.type = "drawing";
        controlP.layer = elementToDublicate.layer;
        controlP.page = elementToDublicate.page;
        controlP.index = drawControllerPointCounter;
        drawControllerPointCounter++;
        controlP.setControlPoint();
        controlP.x = origX;
        controlP.y = origY;
        drawLayerStack.push(controlP);
        elementToDublicate.controlBox.parentNode.insertBefore(controlP.controlBox, elementToDublicate.controlBox.nextSibling);
        elementToDublicate.editImg.parentNode.insertBefore(controlP.editImg, elementToDublicate.editImg.nextSibling);
        zoomDrawing(elementToDublicate, pdfState.zoom, pdfState.zoom);
        rotateDrawing(elementToDublicate, elementToDublicate.elementToControl.rotation);
        zoomDrawing(controlP, pdfState.zoom, pdfState.zoom);
        rotateDrawing(controlP, drawingLayer.rotation);
    } else if (type === "shape") {
        const elementToDublicate = geometryPointsList[index];
        const shapeToDublicate = elementToDublicate.elementToControl;
        const currentShape = Object.create(shape);
        const shapeControllerP = Object.create(shapeControllerPoint);
        const pdfCanvases = document.getElementsByClassName("render_context");
        currentShape.type = shapeToDublicate.type;
        currentShape.xp2 = shapeToDublicate.xp2;
        currentShape.yp2 = shapeToDublicate.yp2;
        currentShape.width = shapeToDublicate.width;
        currentShape.height = shapeToDublicate.height;
        currentShape.strokeWidth = shapeToDublicate.strokeWidth;
        currentShape.stroke = shapeToDublicate.stroke;
        currentShape.fill = shapeToDublicate.fill;
        currentShape.useFill = shapeToDublicate.useFill;
        currentShape.useStroke = shapeToDublicate.useStroke;
        currentShape.rotation = shapeToDublicate.rotation;
        currentShape.page = shapeToDublicate.page;
        shapeControllerP.layer = elementToDublicate.layer;
        shapeControllerP.page = elementToDublicate.page;
        shapeControllerP.index = shapeControllerPointCounter;
        shapeControllerP.rotation = elementToDublicate.rotation;
        geometryPointsList.push(shapeControllerP);
        const canvasToDublicate = elementToDublicate.editImg;
        const canvasContainer = document.createElement("canvas");
        canvasContainer.style.display = "flex";
        canvasContainer.style.position = "absolute";
        canvasContainer.style.top = 0;
        canvasContainer.width = pdfCanvases[thisPage-1].width;
        canvasContainer.height = pdfCanvases[thisPage-1].height;
        canvasContainer.setAttribute('data-page', shapeControllerP.page);
        canvasContainer.setAttribute('data-index', shapeControllerPointCounter);
        shapeControllerPointCounter++;
        canvasContainer.classList.add("editimg");
        canvasContainer.classList.add("shape");
        canvasContainer.classList.add(canvasToDublicate.classList.item(2));
        shapeControllerP.editImg = canvasContainer;
        const ctx = canvasContainer.getContext("2d");
        currentShape.context = ctx;
        currentShape.x = shapeToDublicate.x;
        currentShape.y = shapeToDublicate.y;
        let origX = elementToDublicate.x;
        let origY = elementToDublicate.y;
        shapeControllerP.x = elementToDublicate.x * pdfState.zoom;
        shapeControllerP.y = elementToDublicate.y * pdfState.zoom;
        shapeControllerP.elementToControl = currentShape;
        shapeControllerP.setControlPoint();
        shapeControllerP.x = origX;
        shapeControllerP.y = origY;
        elementToDublicate.controlBox.parentNode.insertBefore(shapeControllerP.controlBox, elementToDublicate.controlBox.nextSibling);
        elementToDublicate.editImg.parentNode.insertBefore(shapeControllerP.editImg, elementToDublicate.editImg.nextSibling);
        zoomGeometry(shapeControllerP);
    }
}

const deepCopy = (arr) => {
    let copy = [];
    arr.forEach(elem => {
        if(Array.isArray(elem)) {
            copy.push(deepCopy(elem))
        } else {
            if (typeof elem === 'object') {
                copy.push(deepCopyObject(elem))
            } else {
                copy.push(elem)
            }
        }
    })
    return copy;
}

// Helper function to deal with Objects
const deepCopyObject = (obj) => {
    let tempObj = {};
    for (let [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            tempObj[key] = deepCopy(value);
        } else {
            if (typeof value === 'object') {
                tempObj[key] = deepCopyObject(value);
            } else {
                tempObj[key] = value
            }
        }
    }
    return tempObj;
}


function relocateLayers(selectedLayer) {
    relocateLayersMode = true;
    let startX;
    let startY;
    let endX;
    let endY;
    let controlP;
    let boxType = "";
    let boxIndex = -1;
    let layerBox;
    let rotateOnce = true;
    let priorX;
    let priorY;
    let otherX;
    let otherY;
    let rect;
    let x = 0;
    let y = 0;
    mouseIsDown = false;
    let layerIndex = parseInt(selectedLayer.getAttribute("data-index"), 10);
    let layerType = selectedLayer.getAttribute("data-type");
    const boxes = document.getElementsByClassName("box");
    for (let i = 0; i < boxes.length; i++) {
        let currentBoxType = boxes[i].classList.item(0);
        let currentBoxIndex = parseInt(boxes[i].getAttribute("data-index"), 10);
        if ((currentBoxType === layerType) && (currentBoxIndex === layerIndex)) {
            layerBox = boxes[i];
            layerBox.onmousedown = startRelocating;
        } 
    }
   
    function startRelocating(e) {
        if (relocateLayersMode) {
            mouseIsDown = true;
            let relocateLayersTarget = e.currentTarget;
            boxType = relocateLayersTarget.classList.item(0);
            boxIndex = parseInt(relocateLayersTarget.getAttribute("data-index"), 10);
            if ((boxIndex === layerIndex) || (boxType === layerType)) {
                if (boxType === "text") {
                    controlP = userTextList[boxIndex];
                } else if (boxType === "drawing") {
                    controlP = drawLayerStack[boxIndex];
                } else if (boxType === "shape") {
                    controlP = geometryPointsList[boxIndex];
                } else if (boxType === "image") {
                    controlP = userImageList[boxIndex];
                }
                priorX = controlP.x;
                priorY = controlP.y;
                rect = controlP.editImg.getBoundingClientRect();  
                context = controlP.editImg.getContext('2d');
                x = controlP.controlBox.offsetLeft - e.clientX;
                y = controlP.controlBox.offsetTop - e.clientY;
                startX = e.clientX - rect.left;
                startY = e.clientY - rect.top;
                window.onmouseup = stopRelocating;
                layerBox.onmousemove = relocating;
                controlBoxTouched = true;
                e.preventDefault();
            }
        }
    }

    function relocating(e) {
        e.preventDefault();
        if (relocateLayersMode && mouseIsDown) {  
            if (boxType === "text" || boxType === "drawing"|| boxType === "image") {
                controlP.controlBox.style.left = (e.clientX + x) + "px";
                controlP.controlBox.style.top = (e.clientY + y) + "px"; 
                controlP.x = (e.clientX + x)/pdfState.zoom;
                controlP.y = (e.clientY + y)/pdfState.zoom;
            } else if (boxType === "shape") {
                if (rotateOnce) {
                    rotateOnce = false;
                    controlP.originX = 0;
                    controlP.originY = 0;
                    controlP.rotateControlPoint();
                }
                controlP.controlBox.style.left = (e.clientX + x) + "px";
                controlP.controlBox.style.top = (e.clientY + y) + "px"; 
                controlP.x = e.clientX + x;
                controlP.y = e.clientY + y;
            }
        }
    }

    async function stopRelocating(e) {
        if (relocateLayersMode) {
            mouseIsDown = false;
            if (controlBoxTouched) {
                endX = e.clientX - rect.left;
                endY = e.clientY - rect.top;
                let deltaX = endX - startX;
                let deltaY = endY - startY;
                let selControlP;
                const selectedLayers = document.getElementsByClassName("layer_selected");
                for (let i = 0; i < selectedLayers.length; i++) {
                    let selLayer = selectedLayers[i];
                    if (selLayer.classList.contains("unlocked")) {
                        let selType = selLayer.getAttribute("data-type");
                        let selIndex = parseInt(selLayer.getAttribute("data-index"), 10);
                        if (selType === "text") {
                            selControlP = userTextList[selIndex];
                            otherX = selControlP.x;
                            otherY = selControlP.y;
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX * pdfState.zoom + deltaX;
                                selControlP.y = priorY * pdfState.zoom + deltaY;
                            } else {
                                selControlP.x = selControlP.x * pdfState.zoom  + deltaX;
                                selControlP.y = selControlP.y * pdfState.zoom  + deltaY;
                            }
                            selControlP.controlBox.style.left = selControlP.x + "px";
                            selControlP.controlBox.style.top = selControlP.y + "px";
                            const pdfLayer = await PDFDocument.create();
                            pdfLayer.registerFontkit(fontkit);
                            const currentText = selControlP.elementToControl;
                            currentText.font = await pdfLayer.embedFont(currentText.fontKey);
                            let pdfCanvases = document.getElementsByClassName("render_context");
                            const pageLayer = pdfLayer.addPage([pdfCanvases[selControlP.page-1].width, pdfCanvases[selControlP.page-1].height]);
                            currentText.pdfDoc = pdfLayer;
                            currentText.x = selControlP.x / pdfState.zoom;
                            currentText.y = selControlP.layer.height - selControlP.y / pdfState.zoom;
                            currentText.setTextElem();
                            const pdfLayerBytes = await pdfLayer.save();
                            currentText.pdfBytes = pdfLayerBytes;
                            await updateUserLayer(selControlP, pdfLayerBytes);
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX + deltaX / pdfState.zoom;
                                selControlP.y = priorY + deltaY / pdfState.zoom;
                            } else {
                                selControlP.x = otherX  + deltaX / pdfState.zoom;
                                selControlP.y = otherY  + deltaY / pdfState.zoom;
                            }
                            currentText.x = selControlP.x;
                            currentText.y = selControlP.layer.height - selControlP.y;
                        } else if (selType === "drawing") {
                            selControlP = drawLayerStack[selIndex];
                            otherX = selControlP.x;
                            otherY = selControlP.y;
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX * pdfState.zoom + deltaX;
                                selControlP.y = priorY * pdfState.zoom + deltaY;
                            } else {
                                selControlP.x = selControlP.x * pdfState.zoom  + deltaX;
                                selControlP.y = selControlP.y * pdfState.zoom  + deltaY;
                            }
                            selControlP.controlBox.style.left = selControlP.x + "px";
                            selControlP.controlBox.style.top = selControlP.y + "px";
                            const context = selControlP.editImg.getContext("2d");
                            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                            for (let i = 0; i < selControlP.elementToControl.paths.length; i++) {
                                context.beginPath();  
                                context.lineJoin = "round";       
                                context.lineWidth = selControlP.elementToControl.paths[i][0].line;
                                context.strokeStyle = selControlP.elementToControl.paths[i][0].color;   
                                context.globalCompositeOperation = selControlP.elementToControl.paths[i][0].compositeOp;
                                selControlP.elementToControl.paths[i][0].x = (selControlP.elementToControl.paths[i][0].x * pdfState.zoom + deltaX) / pdfState.zoom;
                                selControlP.elementToControl.paths[i][0].y = (selControlP.elementToControl.paths[i][0].y * pdfState.zoom + deltaY) / pdfState.zoom;
                                context.moveTo(selControlP.elementToControl.paths[i][0].x, selControlP.elementToControl.paths[i][0].y);                
                                for (let j = 1; j < selControlP.elementToControl.paths[i].length; j++) {
                                    selControlP.elementToControl.paths[i][j].x = (selControlP.elementToControl.paths[i][j].x * pdfState.zoom + deltaX) / pdfState.zoom;
                                    selControlP.elementToControl.paths[i][j].y = (selControlP.elementToControl.paths[i][j].y * pdfState.zoom + deltaY) / pdfState.zoom;
                                    context.lineTo(selControlP.elementToControl.paths[i][j].x, selControlP.elementToControl.paths[i][j].y);
                                }
                                context.stroke(); 
                            } 
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX + deltaX / pdfState.zoom;
                                selControlP.y = priorY + deltaY / pdfState.zoom;
                            } else {
                                selControlP.x = otherX  + deltaX / pdfState.zoom;
                                selControlP.y = otherY  + deltaY / pdfState.zoom;
                            }
                            zoomDrawing(selControlP, pdfState.zoom, pdfState.zoom);
                            rotateDrawing(selControlP, selControlP.elementToControl.rotation);  
                        } else if (selType === "shape") {
                            selControlP = geometryPointsList[selIndex];
                            otherX = selControlP.x;
                            otherY = selControlP.y;
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX * pdfState.zoom + deltaX;
                                selControlP.y = priorY * pdfState.zoom + deltaY;
                            } else {
                                selControlP.originX = 0;
                                selControlP.originY = 0;
                                selControlP.rotateControlPoint();
                                selControlP.x = selControlP.x * pdfState.zoom  + deltaX;
                                selControlP.y = selControlP.y * pdfState.zoom  + deltaY;
                            }
                            selControlP.controlBox.style.left = selControlP.x + "px";
                            selControlP.controlBox.style.top = selControlP.y + "px";
                            const currentShape = selControlP.elementToControl;
                            if (currentShape.type === "rectangle" || currentShape.type === "triangle") {
                                currentShape.x = (selControlP.x - (currentShape.width * pdfState.zoom)/2 + 20) / pdfState.zoom;
                                currentShape.y = (selControlP.y - (currentShape.height * pdfState.zoom)/2 + 20) / pdfState.zoom;
                            } else if (currentShape.type === "circle") {
                                currentShape.x = (selControlP.x + 20)/pdfState.zoom;
                                currentShape.y = (selControlP.y + 20)/pdfState.zoom;
                            }
                            updateUserShapeLayer(selControlP);
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX + deltaX / pdfState.zoom;
                                selControlP.y = priorY + deltaY / pdfState.zoom;
                            } else {
                                selControlP.x = otherX  + deltaX / pdfState.zoom;
                                selControlP.y = otherY  + deltaY / pdfState.zoom;
                            }
                        } else if (selType === "image") {
                            selControlP = userImageList[selIndex];
                            otherX = selControlP.x;
                            otherY = selControlP.y;
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX * pdfState.zoom + deltaX;
                                selControlP.y = priorY * pdfState.zoom + deltaY;
                            } else {
                                selControlP.x = selControlP.x * pdfState.zoom  + deltaX;
                                selControlP.y = selControlP.y * pdfState.zoom  + deltaY;
                            }
                            selControlP.controlBox.style.left = selControlP.x + "px";
                            selControlP.controlBox.style.top = selControlP.y + "px";
                            const pdfLayer = await PDFDocument.create();
                            const currentImage = selControlP.elementToControl;
                            let imgBytes;
                            if (currentImage.type === 'png') {
                                imgBytes = await pdfLayer.embedPng(currentImage.base64String);
                            } else if (currentImage.type === 'jpg') {
                                imgBytes = await pdfLayer.embedJpg(currentImage.base64String);
                            }
                            let pdfCanvases = document.getElementsByClassName("render_context");
                            const pageLayer = pdfLayer.addPage([pdfCanvases[selControlP.page-1].width, pdfCanvases[selControlP.page-1].height]);
                            currentImage.pdfDoc = pdfLayer;
                            currentImage.image = imgBytes;
                            currentImage.x = selControlP.x / pdfState.zoom;
                            currentImage.y = selControlP.layer.height - selControlP.y / pdfState.zoom;
                            currentImage.setImageElem();
                            const pdfLayerBytes = await pdfLayer.save();
                            currentImage.pdfBytes = pdfLayerBytes;
                            await updateUserLayer(selControlP, pdfLayerBytes);
                            if (selIndex === boxIndex && selType === boxType) {
                                selControlP.x = priorX + deltaX / pdfState.zoom;
                                selControlP.y = priorY + deltaY / pdfState.zoom;
                            } else {
                                selControlP.x = otherX  + deltaX / pdfState.zoom;
                                selControlP.y = otherY  + deltaY / pdfState.zoom;
                            }
                            currentImage.x = selControlP.x;
                            currentImage.y = selControlP.layer.height - selControlP.y;
                        }
                    }
                }
            }
            controlBoxTouched = false;
            window.onmouseup = null;
            layerBox.onmousemove = null;
        }
    }
}


document.getElementById("lock").addEventListener("click", function() {
    resetAllModes();
    const selectedLayers = document.getElementsByClassName("layer_selected");
    for (let i = 0; i < selectedLayers.length; i++) {
        lockLayer(selectedLayers[i]);
    }
}, false);

function lockLayer(layer) {
    if (layer.classList.contains("unlocked")) {
        layer.classList.remove("unlocked");
        layer.classList.add("locked");
        layer.style.borderStyle = "solid";
        layer.style.borderWidth = "5px";
        layer.style.borderColor = "rgba(255, 255, 255, 0.8)";
        layer.style.backgroundColor = "rgba(218, 189, 182, 0.8)";
    }
}

document.getElementById("unlock").addEventListener("click", function() {
    resetAllModes();
    const selectedLayers = document.getElementsByClassName("layer_selected");
    for (let i = 0; i < selectedLayers.length; i++) {
        unlockLayer(selectedLayers[i]);
    }
}, false);

function unlockLayer(layer) {
    if (layer.classList.contains("locked")) {
        layer.classList.remove("locked");
        layer.classList.add("unlocked");
        layer.style.backgroundColor = "rgba(218, 189, 182, 0.8)";
        layer.style.borderStyle = "none";
    }
}

function checkForLockStatus(box) {
    let disable = false;
    let boxType = box.classList.item(0);
    let boxIndex = parseInt(box.getAttribute("data-index"), 10);
    const layercons = document.getElementsByClassName("layercontainer");
    for (let i = 0; i < layercons.length; i++) {
        let layerconType = layercons[i].getAttribute("data-type");
        let layerconIndex = parseInt(layercons[i].getAttribute("data-index"), 10);
        if (boxType === layerconType && boxIndex === layerconIndex) {
            if (layercons[i].classList.contains("locked")) {
                disable = true;
            }
        }
    }
    return disable;
}


function hideLayer(layerEye) {
    resetAllModes();
    const checkedIndex = parseInt(layerEye.getAttribute("data-index"), 10);
    const checkedType = layerEye.getAttribute("data-type");
    let layerElem;
    if (checkedType === "shape") {
        layerElem = geometryPointsList[checkedIndex]; 
    } else if (checkedType === "text") {
        layerElem = userTextList[checkedIndex];
    } else if (checkedType === "image") {
        layerElem = userImageList[checkedIndex];
    } else if (checkedType === "drawing") {
        layerElem = drawLayerStack[checkedIndex];
    }
    if (!layerEye.checked) {
        layerElem.controlBox.style.display = "none";
        layerElem.editImg.style.display = "none";
        layerElem.editImg.classList.add("hidden");
        layerElem.editImg.classList.remove("visible");
    } else {
        layerElem.controlBox.style.display = "flex";
        layerElem.editImg.style.display = "flex";
        layerElem.editImg.classList.add("visible");
        layerElem.editImg.classList.remove("hidden");
    }
}


function markLayer(layer) {
    const layerCon = layer.parentNode;
    if (layerCon.classList.contains("layer_selected")) {
        layerCon.classList.remove("layer_selected");
        layerCon.classList.add("layer_unselected");
        layerCon.style.borderStyle = "none";
        if (layerCon.classList.contains("unlocked")) {
            layerCon.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        } else if (layerCon.classList.contains("locked")) {
            layerCon.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
        }
    } else if (layerCon.classList.contains("layer_unselected")) {
        layerCon.style.backgroundColor = "rgba(218, 189, 182, 0.8)";
        layerCon.style.borderStyle = "none";
        layerCon.classList.add("layer_selected");
        layerCon.classList.remove("layer_unselected");
        if (layerCon.classList.contains("locked")) {
            layerCon.style.borderStyle = "solid";
            layerCon.style.borderWidth = "5px";
            layerCon.style.borderColor = "rgba(255, 255, 255, 0.8)";
        }
    }
    leaveRelocateLayersEvent();
}

function markSingleLayer(layer) {
    const layercontainers = document.getElementsByClassName("layercontainer");
    for (let i = 0; i < layercontainers.length; i++) {
        if (layercontainers[i].classList.contains("layer_selected")) {
            layercontainers[i].style.borderStyle = "none";
            layercontainers[i].classList.remove("layer_selected");
            layercontainers[i].classList.add("layer_unselected");
            if (layercontainers[i].classList.contains("unlocked")) {
                layercontainers[i].style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            } else if (layercontainers[i].classList.contains("locked")) {
                layercontainers[i].style.backgroundColor = "rgba(255, 255, 255, 0.8)";
            }
        }
    }
    const layerCon = layer.parentNode;
    layerCon.style.backgroundColor = "rgba(218, 189, 182, 0.8)";
    layerCon.style.borderStyle = "none";
    layerCon.classList.add("layer_selected");
    layerCon.classList.remove("layer_unselected");
    if (layerCon.classList.contains("locked")) {
        layerCon.style.borderStyle = "solid";
        layerCon.style.borderWidth = "5px";
        layerCon.style.borderColor = "rgba(255, 255, 255, 0.8)";
    }
}

function markSingleLayerOnEdit(controlP) {
    let index = controlP.index;
    const layernames = document.getElementsByClassName("layername");
    for (let i = 0; i < layernames.length; i++) {
        let layerIndex = parseInt(layernames[i].getAttribute("data-index"), 10);
        let layerType = layernames[i].getAttribute("data-type");
        if (layerIndex === index && controlP.editImg.classList.contains(layerType)) {
            markSingleLayer(layernames[i]);
        }
    }
}


function moveLayer(target) {
    let items = target.getElementsByClassName("layercontainer");
    let current;
    let layername;
    for (const i of items) {
        i.draggable = true;
        i.ondragstart = e => {
            resetAllModes();
            current = i;
            layername = current.children[1];
            markSingleLayer(layername);
        };
        i.ondragover = e => {
            e.preventDefault();
        };
        i.ondrop = async e => {
            e.preventDefault();
            if (i != current) {
                leaveRelocateLayersEvent();
                let currentpos = 0, droppedpos = 0;
                for (let it=0; it<items.length; it++) {
                    if (current == items[it]) { 
                        currentpos = it; 
                    }
                    if (i == items[it]) { 
                        droppedpos = it; 
                    }
                }
                const srcPage = parseInt(current.getAttribute("data-page"), 10);
                let canvasToMove;
                let controlPToMove;
                let elementToMove;
                let elementControlP;
                const canvasIndex = parseInt(current.getAttribute('data-index'), 10);
                const canvasType = current.getAttribute('data-type');
                if (canvasType === "shape") {
                    elementControlP = geometryPointsList[canvasIndex];
                    canvasToMove = geometryPointsList[canvasIndex].editImg;
                    controlPToMove = geometryPointsList[canvasIndex].controlBox;
                    elementToMove = geometryPointsList[canvasIndex].elementToControl;
                } else if (canvasType === "text") {
                    elementControlP = userTextList[canvasIndex];
                    canvasToMove = userTextList[canvasIndex].editImg;
                    controlPToMove = userTextList[canvasIndex].controlBox;
                    elementToMove = userTextList[canvasIndex].elementToControl;
                } else if (canvasType === "drawing") {
                    elementControlP = drawLayerStack[canvasIndex];
                    canvasToMove = drawLayerStack[canvasIndex].editImg;
                    controlPToMove = drawLayerStack[canvasIndex].controlBox;
                    elementToMove = drawLayerStack[canvasIndex].elementToControl;
                } else if (canvasType === "image") {
                    elementControlP = userImageList[canvasIndex];
                    canvasToMove = userImageList[canvasIndex].editImg;
                    controlPToMove = userImageList[canvasIndex].controlBox;
                    elementToMove = userImageList[canvasIndex].elementToControl;
                }
                let destPage = parseInt(i.getAttribute("data-page"), 10);
                let destCanvas;
                let destControlP;
                const destCanvasIndex = parseInt(i.getAttribute('data-index'), 10);
                const destCanvasType = i.getAttribute('data-type');
                if (destCanvasType === "shape") {
                    destCanvas = geometryPointsList[destCanvasIndex].editImg;
                    destControlP = geometryPointsList[destCanvasIndex].controlBox;
                } else if (destCanvasType === "text") {
                    destCanvas = userTextList[destCanvasIndex].editImg;
                    destControlP = userTextList[destCanvasIndex].controlBox;
                } else if (destCanvasType === "drawing") {
                    destCanvas = drawLayerStack[destCanvasIndex].editImg;
                    destControlP = drawLayerStack[destCanvasIndex].controlBox;
                } else if (destCanvasType === "image") {
                    destCanvas = userImageList[destCanvasIndex].editImg;
                    destControlP = userImageList[destCanvasIndex].controlBox;
                }
                if (currentpos < droppedpos) {   
                    i.parentNode.insertBefore(current, i.nextSibling);
                    destCanvas.parentNode.insertBefore(canvasToMove, destCanvas.nextSibling);
                    destControlP.parentNode.insertBefore(controlPToMove, destControlP.nextSibling);
                } else {
                    i.parentNode.insertBefore(current, i);
                    destCanvas.parentNode.insertBefore(canvasToMove, destCanvas);
                    destControlP.parentNode.insertBefore(controlPToMove, destControlP);
                }
                if (srcPage !== destPage) {
                    canvasToMove.setAttribute("data-page", destPage);
                    controlPToMove.setAttribute("data-page", destPage);
                    elementControlP.page = destPage;
                    elementToMove.page = destPage;
                    current.setAttribute("data-page", destPage);
                    if (canvasToMove.width !== destCanvas.width || canvasToMove.height !== destCanvas.height) {
                        canvasToMove.width = destCanvas.width;
                        canvasToMove.height = destCanvas.height;
                        canvasToMove.style.width = destCanvas.width + "px";
                        canvasToMove.style.height = destCanvas.height + "px";
                        await redraw(elementControlP);
                    }
                    let eyeLabel = current.children[0];
                    eyeLabel.setAttribute("data-page", destPage);
                    let layerEye = current.children[0].children[0];
                    layerEye.setAttribute("data-page", destPage);
                    layername = current.children[1];
                    layername.setAttribute("data-page", destPage);
                }
                layername = current.children[1];
                markSingleLayer(layername);
            }
            const pageLayerGroups = document.getElementsByClassName("layerlabel");
            for (let j = 0; j < pageLayerGroups.length; j++) {
                if (pageLayerGroups[j].children.length === 0) {
                    pageLayerGroups[j].parentNode.removeChild(pageLayerGroups[j]);
                }
            }
        };
    }
}

async function redraw(controlP) {
    if (controlP.editImg.classList.item(1) === "text" || controlP.editImg.classList.item(1) === "image") {
        await updateUserLayer(controlP, controlP.elementToControl.pdfBytes);
    } else if (controlP.editImg.classList.item(1) === "drawing") {
        zoomDrawing(controlP, pdfState.zoom, pdfState.zoom);
        rotateDrawing(controlP, controlP.elementToControl.rotation);
    } else if (controlP.editImg.classList.item(1) === "shape") {
        zoomGeometry(controlP);
    }
}