/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 1.0.0
 * @description Layer creation, order, selection, hiding
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */



let firstStackLayer = true;
let layerNameCounterText = 1;
let layerNameCounterShape = 1;
let layerNameCounterDrawing = 1;
let layerNameCounterImage = 1;


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
        i.ondrop = e => {
            e.preventDefault();
            if (i != current) {
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
                const canvasIndex = parseInt(current.getAttribute('data-index'), 10);
                const canvasType = current.getAttribute('data-type');
                if (canvasType === "shape") {
                    canvasToMove = geometryPointsList[canvasIndex].editImg;
                    controlPToMove = geometryPointsList[canvasIndex].controlBox;
                    elementToMove = geometryPointsList[canvasIndex].elementToControl;
                } else if (canvasType === "text") {
                    canvasToMove = userTextList[canvasIndex].editImg;
                    controlPToMove = userTextList[canvasIndex].controlBox;
                    elementToMove = userTextList[canvasIndex].elementToControl;
                } else if (canvasType === "drawing") {
                    canvasToMove = drawLayerStack[canvasIndex].editImg;
                    controlPToMove = drawLayerStack[canvasIndex].controlBox;
                    elementToMove = drawLayerStack[canvasIndex].elementToControl;
                } else if (canvasType === "image") {
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
                    controlPToMove.page = destPage;
                    elementToMove.page = destPage;
                    current.setAttribute("data-page", destPage);
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