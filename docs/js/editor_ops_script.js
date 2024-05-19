/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 2.1.0
 * @description Editor all-element operations
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */


const deleteOps = document.getElementsByClassName("delete_op");
const moveOps = document.getElementsByClassName("move_op");

for (let j = 0; j < deleteOps.length; j++) {
    deleteOps[j].addEventListener("click", function() {
        resetAllModes();
        if (boxApplyMode) {
            editorModes[0] = true;
            let controlBoxes = document.querySelectorAll("div.box");
            for (let i = 0; i < controlBoxes.length; i++) {
                controlBoxes[i].onclick = function(e) {
                    const deleteBox = e.currentTarget;
                    let disable = checkForLockStatus(deleteBox);
                    if (disable) {
                        editorModes[0] = false;
                    }
                    if (editorModes[0]) {
                        const deletePage = parseInt(deleteBox.getAttribute("data-page"), 10);
                        const deleteIndex = parseInt(deleteBox.getAttribute('data-index'), 10);
                        const deleteType = deleteBox.classList.item(0);
                        deleteElement(deletePage, deleteIndex, deleteType);
                        deleteLayerByElement(deletePage, deleteIndex, deleteType);
                    }
                }
            }
        } 
        if (layerApplyMode) {
            deleteLayer();
        }
    }, false);
}

function deleteElement(page, deleteIndex, type) {
    let elemToDelete;
    if (type === "text") {
        elemToDelete = userTextList[deleteIndex];
        userTextList.splice(deleteIndex, 1);
    }
    if (type === "drawing") {
        elemToDelete = drawLayerStack[deleteIndex];
        drawLayerStack.splice(deleteIndex, 1);
    }
    if (type === "shape") {
        elemToDelete = geometryPointsList[deleteIndex];
        geometryPointsList.splice(deleteIndex, 1);
    }
    if (type === "image") {
        elemToDelete = userImageList[deleteIndex];
        userImageList.splice(deleteIndex, 1);
    }
    const writeLayer = document.getElementsByClassName("write_layer")[page-1];
    const groupImages = writeLayer.getElementsByClassName("editimg_group")[0];
    elemToDelete.editImg.parentNode.removeChild(elemToDelete.editImg);
    elemToDelete.controlBox.parentNode.removeChild(elemToDelete.controlBox);
    if (type === "text") {
        textControllerPointCounter--;
        for (let i = deleteIndex; i < userTextList.length; i++) {
            userTextList[i].index = i;
            userTextList[i].controlBox.dataset.index = i.toString();
            userTextList[i].editImg.dataset.index = i.toString();
        }
    }
    if (type === "drawing") {
        drawControllerPointCounter--;
        for (let i = deleteIndex; i < drawLayerStack.length; i++) {
            drawLayerStack[i].index = i;
            drawLayerStack[i].controlBox.dataset.index = i.toString();
            drawLayerStack[i].editImg.dataset.index = i.toString();
        }
    }
    if (type === "shape") {
        shapeControllerPointCounter--;
        for (let i = deleteIndex; i < geometryPointsList.length; i++) {
            geometryPointsList[i].index = i;
            geometryPointsList[i].controlBox.dataset.index = i.toString();
            geometryPointsList[i].editImg.dataset.index = i.toString();
        }
    }
    if (type === "image") {
        imageControllerPointCounter--;
        for (let i = deleteIndex; i < userImageList.length; i++) {
            userImageList[i].index = i;
            userImageList[i].controlBox.dataset.index = i.toString();
            userImageList[i].editImg.dataset.index = i.toString();
        }
    }
    if (groupImages.children.length === 0) {
        groupImages.parentNode.removeChild(groupImages);
        const groupControlP = writeLayer.getElementsByClassName("control_group")[0];
        groupControlP.parentNode.removeChild(groupControlP);
        layerNameCounterText = 1;
    }
}


for (let j = 0; j < deleteOps.length; j++) {
    deleteOps[j].addEventListener("click", function() {
        resetAllModes();
        if (boxApplyMode) {
            editorModes[1] = true;
            for(let i = 0; i < userTextList.length; i++) {
                moveElement(userTextList[i]);
            }
            for(let i = 0; i < drawLayerStack.length; i++) {
                moveElement(drawLayerStack[i]);
            }
            for(let i = 0; i < geometryPointsList.length; i++) {
                moveElement(geometryPointsList[i]);
            }
            for(let i = 0; i < userImageList.length; i++) {
                moveElement(userImageList[i]);
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
}

function moveElement(controlP) {
    let rotateOnce = true;
    let startX;
    let startY;
    let endX;
    let endY;
    let x = 0;
    let y = 0;
    mouseIsDown = false;
    let controlBoxTouched = false;
    controlP.controlBox.onmousedown = startMovingElement;    

    function startMovingElement(e) {
        let disable = checkForLockStatus(controlP.controlBox);
        if (disable) {
            editorModes[1] = false;
        }
        if (editorModes[1]) {
            mouseIsDown = true;
            markSingleLayerOnEdit(controlP);
            x = controlP.controlBox.offsetLeft - e.clientX;
            y = controlP.controlBox.offsetTop - e.clientY;
            if (controlP.type === "drawing") {
                startX = controlP.x;
                startY = controlP.y; 
            }
            window.onmouseup = stopMovingElement;
            controlP.controlBox.onmousemove = movingElement;
            controlBoxTouched = true;
            e.preventDefault();
        }
    }

    function movingElement(e) {
        if (editorModes[1] && mouseIsDown) {
            if (controlP.type === "shape") {
                if (rotateOnce) {
                    rotateOnce = false;
                    shapeBox.originX = 0;
                    shapeBox.originY = 0;
                    shapeBox.rotateControlPoint();
                }
            }
            controlP.controlBox.style.left = (e.clientX + x) + "px";
            controlP.controlBox.style.top = (e.clientY + y) + "px"; 
            if (controlP.type === "text" || controlP.type === "drawing" || controlP.type === "image") {
                controlP.x = (e.clientX + x) / pdfState.zoom;
                controlP.y = (e.clientY + y) / pdfState.zoom;
            }
            if (controlP.type === "shape") {
                controlP.x = e.clientX + x;
                controlP.y = e.clientY + y;
            }
        }
    }

    async function stopMovingElement() {
        if (editorModes[1]) {
            mouseIsDown = false;
            if (controlBoxTouched) {
                if (controlP.type === "text") {
                    const pdfLayer = await PDFDocument.create();
                    pdfLayer.registerFontkit(fontkit);
                    const currentText = controlP.elementToControl;
                    currentText.font = await pdfLayer.embedFont(currentText.fontKey);
                    let pdfCanvases = document.getElementsByClassName("render_context");
                    pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
                    currentText.pdfDoc = pdfLayer;
                    currentText.x = controlP.x;
                    currentText.y = controlP.layer.height - controlP.y;
                    currentText.setTextElem();
                    const pdfLayerBytes = await pdfLayer.save();
                    currentText.pdfBytes = pdfLayerBytes;
                    await updateUserLayer(controlP, pdfLayerBytes);
                }
                if (controlP.type === "drawing") {
                    endX = controlP.x;
                    endY = controlP.y;
                    let deltaX = endX - startX;
                    let deltaY = endY - startY;
                    let context = controlP.editImg.getContext('2d');  
                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                    for (let i = 0; i < controlP.elementToControl.paths.length; i++) {
                        context.beginPath();  
                        context.lineCap = "round";
                        context.lineJoin = "round";       
                        context.lineWidth = controlP.elementToControl.paths[i][0].line;
                        context.strokeStyle = controlP.elementToControl.paths[i][0].color;   
                        context.globalCompositeOperation = controlP.elementToControl.paths[i][0].compositeOp;
                        controlP.elementToControl.paths[i][0].x = controlP.elementToControl.paths[i][0].x + deltaX;
                        controlP.elementToControl.paths[i][0].y = controlP.elementToControl.paths[i][0].y + deltaY;
                        context.moveTo(controlP.elementToControl.paths[i][0].x, controlP.elementToControl.paths[i][0].y);                
                        for (let j = 1; j < controlP.elementToControl.paths[i].length; j++) {
                            controlP.elementToControl.paths[i][j].x = controlP.elementToControl.paths[i][j].x + deltaX;
                            controlP.elementToControl.paths[i][j].y = controlP.elementToControl.paths[i][j].y + deltaY;
                            context.lineTo(controlP.elementToControl.paths[i][j].x, controlP.elementToControl.paths[i][j].y);
                        }
                        context.stroke();
                    }
                    zoomDrawing(controlP, pdfState.zoom, pdfState.zoom);
                    rotateDrawing(controlP, controlP.elementToControl.rotation);
                }
                if (controlP.type === "shape") {
                    const currentShape = controlP.elementToControl;
                    if (currentShape.type === "rectangle" || currentShape.type === "triangle") {
                        currentShape.x = (controlP.x - (currentShape.width * pdfState.zoom)/2 + 20) / pdfState.zoom;
                        currentShape.y = (controlP.y - (currentShape.height * pdfState.zoom)/2 + 20) / pdfState.zoom;
                    } else if (currentShape.type === "circle") {
                        currentShape.x = (controlP.x + 20)/pdfState.zoom;
                        currentShape.y = (controlP.y + 20)/pdfState.zoom;
                    }
                    updateUserShapeLayer(shapeBox);
                }
                if (controlP.type === "image") {
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
                    currentImage.x = controlP.x;
                    currentImage.y = controlP.layer.height - controlP.y;
                    currentImage.setImageElem();
                    const pdfLayerBytes = await pdfLayer.save();
                    currentImage.pdfBytes = pdfLayerBytes;
                    await updateUserLayer(controlP, pdfLayerBytes);
                }
            }
            controlBoxTouched = false;
            window.onmouseup = null;
            controlP.controlBox.onmousemove = null;
        }
    }
}