let layerApplyMode = false;
let boxApplyMode = true;
let clicked = false;
let short = false;
let copyCounter = 1;
let relocateLayersMode = false;


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
            if (deleteType === "shape") {
                deleteShape(geometryPointsList[deleteIndex].controlBox, deletePage, deleteIndex);
            } else if (deleteType === "text") {
                deleteText(userTextList[deleteIndex].controlBox, deletePage, deleteIndex);
            } else if (deleteType === "drawing") {
                deleteDrawing(drawLayerStack[deleteIndex].controlBox, deletePage, deleteIndex);
            } else if (deleteType === "image") {
                deleteImage(userImageList[deleteIndex].controlBox, deletePage, deleteIndex);
            }
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
            layercontainers[i].children[1].dataset.inde -= 1;
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
    let layerBox;
    let boxType;
    let boxIndex;
    let rotateOnce = true;
    let priorX;
    let priorY;
    let otherX;
    let otherY;
    let rect;
    let x = 0;
    let y = 0;
    mouseIsDown = false;
    let controlBoxTouched = false;
    let layerIndex = parseInt(selectedLayer.getAttribute("data-index"), 10);
    let layerType = selectedLayer.getAttribute("data-type");
    const boxes = document.getElementsByClassName("box");
    for (let i = 0; i < boxes.length; i++) {
        let currentBoxType = boxes[i].classList[0];
        let currentBoxIndex = parseInt(boxes[i].getAttribute("data-index"), 10);
        if (currentBoxType === layerType && currentBoxIndex === layerIndex) {
            layerBox = boxes[i];
        } 
    }
    layerBox.onmousedown = startRelocating;

    function startRelocating(e) {
        if (relocateLayersMode && !clicked) {
            mouseIsDown = true;
            let box = e.currentTarget;
            boxType = box.classList[0];
            boxIndex = parseInt(box.getAttribute("data-index"), 10);
            if (boxIndex === layerIndex && boxType === layerType) {
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
    let boxType = box.classList[0];
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