let drawLayer = {
    paths: [],
    currentPathIndex: 0, 
    rotation: 0,
    wasRotated: false
}

const colorPickerPencil = new Alwan('#colorpicker_pencil', {
    theme: 'dark',
    toggle: 'false',
    popover: 'false',
    color: '#000',
    default: '#000',
    format: 'rgba',
    singleInput: false,
    opacity: true,
    preview: true,
    closeOnScroll: false,
    copy: true
});

let pencilColor = "rgba(0,0,0,1.0)";
let eraserColor = "rgba(0,0,0,1.0)";
let colorPickerValue;
let addLayer = true;
let pencilSize = 4;
let drawControllerPointCounter = 0;
let rotateDrawSelectorTriggered = false;
let rotateDrawInputFieldTriggered = false;


document.getElementById('pencil').addEventListener("click", function() {
    resetAllModes();
    userModesDrawer[0] = true;
    for(let i = 0; i < writeLayerStack.length; i++) {
        draw(writeLayerStack[i]);
    }  
}, false);

function draw(writeLayer) {
    let controlP;
    writeLayer.onmousedown = startDrawing;

    function startDrawing(event) {
        if (userModesDrawer[0] && event.currentTarget === writeLayer) {
            isDrawing = true;
            writeLayer.style.cursor = "crosshair";
            let page = parseInt(writeLayer.getAttribute("data-write"));
            if (writeLayer.getElementsByClassName("drawing").length == 0) {
                addLayer = true;
            }
            if (addLayer) {
                addLayer = false;
                controlP = createUserDrawLayer(event, "drawing", page, writeLayer);
            } else {
                let isSelected = false;
                let selectedLayer;
                const layerCons = document.getElementsByClassName("layercontainer");
                for (let i = 0; i < layerCons.length; i++) {
                    if (parseInt(layerCons[i].getAttribute("data-page")) === parseInt(writeLayer.getAttribute("data-write"))) {
                        if (layerCons[i].classList.contains("layer_selected") && layerCons[i].getAttribute("data-type") === "drawing") {
                            isSelected = true;
                            selectedLayer = layerCons[i];
                            let remainingLayer;
                            for (let j = i+1; j < layerCons.length; j++) {
                                if (layerCons[j].classList.contains("layer_selected") && layerCons[j].getAttribute("data-type") === "drawing") {
                                    remainingLayer = layerCons[j];
                                    remainingLayer.classList.remove("layer_selected");
                                    remainingLayer.classList.add("layer_unselected");
                                    remainingLayer.style.borderStyle = "none";
                                    if (remainingLayer.classList.contains("unlocked")) {
                                        remainingLayer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                                    } else if (remainingLayer.classList.contains("locked")) {
                                        remainingLayer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
                if (isSelected) {
                    let layerIndex = parseInt(selectedLayer.getAttribute("data-index"));
                    controlP = drawLayerStack[layerIndex];
                    if (controlP.elementToControl.wasRotated) {
                        controlP = createUserDrawLayer(event, "drawing", page, writeLayer);
                    }
                } else {
                    const editImgGroup = writeLayer.querySelectorAll("div.editimg_group")[0];
                    let lastDrawCanvas = editImgGroup.getElementsByClassName("drawing")[editImgGroup.getElementsByClassName("drawing").length - 1];
                    const lastIndex = parseInt(lastDrawCanvas.getAttribute("data-index"));
                    controlP = drawLayerStack[lastIndex];   
                    for (let i = 0; i < layerCons.length; i++) {
                        if (layerCons[i].classList.contains("layer_selected")) {
                            layerCons[i].classList.remove("layer_selected");
                            layerCons[i].classList.add("layer_unselected");
                            layerCons[i].style.borderStyle = "none";
                            if (layerCons[i].classList.contains("unlocked")) {
                                layerCons[i].style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                            } else if (layerCons[i].classList.contains("locked")) {
                                layerCons[i].style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                            }
                        }
                    }
                    for (let i = 0; i < layerCons.length; i++) {
                        if (layerCons[i].getAttribute("data-type") === "drawing" && parseInt(layerCons[i].getAttribute("data-index")) === lastIndex) {
                            layerCons[i].classList.remove("layer_unselected");
                            layerCons[i].classList.add("layer_selected");
                            layerCons[i].style.backgroundColor = "rgba(218, 189, 182, 0.8)";
                            layerCons[i].style.borderStyle = "none";
                            if (layerCons[i].classList.contains("locked")) {
                                layerCons[i].style.borderStyle = "solid";
                                layerCons[i].style.borderWidth = "5px";
                                layerCons[i].style.borderColor = "rgba(255, 255, 255, 0.8)";
                            }
                        }
                    }            
                } 
            }
            let disable = checkForLockStatus(controlP.controlBox);
            if (disable) {
                writeLayer.style.cursor = "default";
            }
            if (!disable) {
                let context = controlP.editImg.getContext("2d");
                zoomDrawing(controlP, pdfState.zoom, pdfState.zoom);
                let rect = controlP.editImg.getBoundingClientRect();     
                context.beginPath(); 
                context.lineCap = "round";
                context.lineJoin = "round"; 
                context.lineWidth = pencilSize;
                context.strokeStyle = pencilColor; 
                context.globalCompositeOperation = 'source-over';
                context.moveTo((event.clientX - rect.left)/pdfState.zoom, (event.clientY - rect.top)/pdfState.zoom);

                if (typeof controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex] == 'undefined')
                    controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex] = [];
                
                controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex].push({
                    x: ((event.clientX - rect.left)/pdfState.zoom), 
                    y: ((event.clientY - rect.top)/pdfState.zoom), 
                    line: pencilSize, 
                    color: pencilColor, 
                    compositeOp: 'source-over'
                });                
                writeLayer.onmouseup = stopDrawing;
                writeLayer.onmousemove = drawing;
            }
        }
    }

    function drawing(event) {
        if (userModesDrawer[0]) {
            if (!isDrawing) return; 
            let context = controlP.editImg.getContext("2d");
            let rect = controlP.editImg.getBoundingClientRect(); 
            context.lineTo((event.clientX - rect.left)/pdfState.zoom, (event.clientY - rect.top)/pdfState.zoom);
            context.stroke();
            controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex].push({
                x: ((event.clientX - rect.left)/pdfState.zoom), 
                y: ((event.clientY - rect.top)/pdfState.zoom), 
                line: pencilSize, 
                color: pencilColor, 
                compositeOp: 'source-over'
            });
        }
    }

    function stopDrawing(event) {
        if (userModesDrawer[0]) {
            isDrawing = false;
            controlP.elementToControl.currentPathIndex += 1;
            if (event.currentTarget === writeLayer) {
                writeLayer.onmouseup = null;
                writeLayer.onmousemove = null;
                writeLayer.style.cursor = "default";
            }
        }
    }
}

function createUserDrawLayer(e, editImgClass, thisPage, writeLayer) {
    let controlGroupDiv;
    if (writeLayer.querySelectorAll("div.control_group").length == 0) {
        controlGroupDiv = document.createElement("div");
        controlGroupDiv.style.position = "absolute";
        controlGroupDiv.style.top = 0;
        controlGroupDiv.setAttribute('data-page', thisPage);
        controlGroupDiv.classList.add("control_group");
        writeLayer.appendChild(controlGroupDiv);
    }
    let pdfCanvases = document.getElementsByClassName("render_context");
    const drawingLayer = Object.create(drawLayer);
    const controlP = Object.create(controlPoint);
    drawingLayer.paths = [];
    drawingLayer.currentPathIndex = 0;
    drawingLayer.rotation = 0;
    controlP.elementToControl = drawingLayer;
    const canvasContainer = document.createElement("canvas");
    canvasContainer.style.display = "flex";
    canvasContainer.style.position = "absolute";
    canvasContainer.style.top = 0;
    canvasContainer.width = pdfCanvases[thisPage-1].width;
    canvasContainer.height = pdfCanvases[thisPage-1].height;
    canvasContainer.setAttribute('data-page', thisPage);
    canvasContainer.setAttribute('data-index', drawControllerPointCounter);
    canvasContainer.classList.add("editimg");
    canvasContainer.classList.add(editImgClass);
    controlP.editImg = canvasContainer;
    
    let rect = writeLayer.getBoundingClientRect();
    let mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    controlP.x = mousePos.x;
    controlP.y = mousePos.y;
    controlP.type = "drawing";
    controlP.layer = writeLayer;
    controlP.page = thisPage;
    controlP.index = drawControllerPointCounter;
    controlP.setControlPoint();
    controlP.x = mousePos.x/pdfState.zoom;
    controlP.y = mousePos.y/pdfState.zoom;
    drawLayerStack.push(controlP);
    writeLayer.querySelectorAll("div.control_group")[0].appendChild(controlP.controlBox);

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
    createStackLayer(thisPage, editImgClass, drawControllerPointCounter);
    drawControllerPointCounter++;
    return controlP;
}


document.getElementById('eraser').addEventListener("click", function() { 
    resetAllModes();
    userModesDrawer[1] = true;
    for(let i = 0; i < writeLayerStack.length; i++) {
        erase(writeLayerStack[i]);
    }
}, false);

function erase(writeLayer) {
    let controlP;
    writeLayer.onmousedown = startErasing;

    function startErasing(event) {
        if (userModesDrawer[1] && event.currentTarget === writeLayer) {
            isErasing = true;
            writeLayer.style.cursor = "cell";
                
            let isSelected = false;
            let selectedLayer;
            const layerCons = document.getElementsByClassName("layercontainer");
            for (let i = 0; i < layerCons.length; i++) {
                if (parseInt(layerCons[i].getAttribute("data-page")) === parseInt(writeLayer.getAttribute("data-write"))) {
                    if (layerCons[i].classList.contains("layer_selected") && layerCons[i].getAttribute("data-type") === "drawing") {
                        isSelected = true;
                        selectedLayer = layerCons[i];
                        let remainingLayer;
                        for (let j = i+1; j < layerCons.length; j++) {
                            if (layerCons[j].classList.contains("layer_selected") && layerCons[j].getAttribute("data-type") === "drawing") {
                                remainingLayer = layerCons[j];
                                remainingLayer.classList.remove("layer_selected");
                                remainingLayer.classList.add("layer_unselected");
                                remainingLayer.style.borderStyle = "none";
                                if (remainingLayer.classList.contains("unlocked")) {
                                    remainingLayer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                                } else if (remainingLayer.classList.contains("locked")) {
                                    remainingLayer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                                }
                            }
                        }
                        break;
                    }
                }
            }
            if (isSelected) {
                let layerIndex = parseInt(selectedLayer.getAttribute("data-index"));
                controlP = drawLayerStack[layerIndex];
            } else {
                const editImgGroup = writeLayer.querySelectorAll("div.editimg_group")[0];
                let lastDrawCanvas = editImgGroup.getElementsByClassName("drawing")[editImgGroup.getElementsByClassName("drawing").length - 1];
                const lastIndex = parseInt(lastDrawCanvas.getAttribute("data-index"));
                controlP = drawLayerStack[lastIndex];   
                for (let i = 0; i < layerCons.length; i++) {
                    if (layerCons[i].classList.contains("layer_selected")) {
                        layerCons[i].classList.remove("layer_selected");
                        layerCons[i].classList.add("layer_unselected");
                        layerCons[i].style.borderStyle = "none";
                        if (layerCons[i].classList.contains("unlocked")) {
                            layerCons[i].style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                        } else if (layerCons[i].classList.contains("locked")) {
                            layerCons[i].style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                        }
                    } 
                }
                for (let i = 0; i < layerCons.length; i++) {
                    if (layerCons[i].getAttribute("data-type") === "drawing" && parseInt(layerCons[i].getAttribute("data-index")) === lastIndex) {
                        layerCons[i].classList.remove("layer_unselected");
                        layerCons[i].classList.add("layer_selected");
                        layerCons[i].style.backgroundColor = "rgba(218, 189, 182, 0.8)";
                        layerCons[i].style.borderStyle = "none";
                        if (layerCons[i].classList.contains("locked")) {
                            layerCons[i].style.borderStyle = "solid";
                            layerCons[i].style.borderWidth = "5px";
                            layerCons[i].style.borderColor = "rgba(255, 255, 255, 0.8)";
                        }
                    }
                }
            } 
            let disable = checkForLockStatus(controlP.controlBox);
            if (disable) {
                writeLayer.style.cursor = "default";
            }
            if (!disable) {
                let context = controlP.editImg.getContext("2d");
                zoomDrawing(controlP, pdfState.zoom, pdfState.zoom);
                let rect = controlP.editImg.getBoundingClientRect();     
                context.beginPath(); 
                context.lineCap = "round";
                context.lineJoin = "round"; 
                context.lineWidth = pencilSize;
                context.strokeStyle = eraserColor; 
                context.globalCompositeOperation = 'destination-out';    
                context.moveTo((event.clientX - rect.left)/pdfState.zoom, (event.clientY - rect.top)/pdfState.zoom);
                
                if (typeof controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex] == 'undefined')
                    controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex] = [];
                
                controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex].push({
                    x: ((event.clientX - rect.left)/pdfState.zoom), 
                    y: ((event.clientY - rect.top)/pdfState.zoom), 
                    line: pencilSize, 
                    color: pencilColor, 
                    compositeOp: 'destination-out'
                });                
                writeLayer.onmouseup = stopErasing;
                writeLayer.onmousemove = erasing;
            }
        }
    }

    function erasing(event) {
        if (userModesDrawer[1]) {
            if (!isErasing) return; 
            let context = controlP.editImg.getContext("2d");
            let rect = controlP.editImg.getBoundingClientRect(); 
            context.lineTo((event.clientX - rect.left)/pdfState.zoom, (event.clientY - rect.top)/pdfState.zoom);
            context.stroke();
            controlP.elementToControl.paths[controlP.elementToControl.currentPathIndex].push({
                x: ((event.clientX - rect.left)/pdfState.zoom), 
                y: ((event.clientY - rect.top)/pdfState.zoom), 
                line: pencilSize, 
                color: pencilColor, 
                compositeOp: 'destination-out'
            }); 
        }
    }

    function stopErasing(event) {
        if (userModesDrawer[1]) {
            isErasing = false;
            controlP.elementToControl.currentPathIndex += 1;
            if (event.currentTarget === writeLayer) {
                writeLayer.onmouseup = null;
                writeLayer.onmousemove = null;
                writeLayer.style.cursor = "default";
            }

        }
    }
}

document.getElementById('newlayer').addEventListener("click", function() {
    resetAllModes();
    addLayer = true;
}, false);


document.getElementById('delete_draw').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesDrawer[2] = true;
        let drawBoxes = document.querySelectorAll("div.drawing");
        for(let i = 0; i < drawBoxes.length; i++) {
            drawBoxes[i].onclick = function(e) {
                const deleteBox = e.currentTarget;
                let disable = checkForLockStatus(deleteBox);
                if (disable) {
                    userModesDrawer[2] = false;
                }
                if (userModesDrawer[2]) {
                    let deleteIndex = parseInt(deleteBox.getAttribute('data-index'));
                    let deletePage = parseInt(deleteBox.getAttribute("data-page"));
                    deleteDrawing(deleteBox, deletePage, deleteIndex);
                    deleteLayerByElement(deletePage, deleteIndex, "drawing");
                }
            }
        }
    }
    if (layerApplyMode) {
        deleteLayer();
    }
}, false);

function deleteDrawing(controlP, page, boxIndex) {
    const drawingToDelete = drawLayerStack[boxIndex];
    drawLayerStack.splice(boxIndex, 1);
    const writeLayer = document.getElementsByClassName("write_layer")[page-1];
    const groupImages = writeLayer.getElementsByClassName("editimg_group")[0];
    drawingToDelete.editImg.parentNode.removeChild(drawingToDelete.editImg);
    controlP.parentNode.removeChild(controlP);
    drawControllerPointCounter--;
    for (let i = boxIndex; i < drawLayerStack.length; i++) {
        drawLayerStack[i].index = i;
        drawLayerStack[i].controlBox.dataset.index = i.toString();
        drawLayerStack[i].editImg.dataset.index = i.toString();
    }
    if (groupImages.children.length === 0) {
        groupImages.parentNode.removeChild(groupImages);
        const groupControlP = writeLayer.getElementsByClassName("control_group")[0];
        groupControlP.parentNode.removeChild(groupControlP);
        layerNameCounterDrawing = 1;
    }
}


document.getElementById('translate_draw').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesDrawer[3] = true;
        for(let i = 0; i < drawLayerStack.length; i++) {
            moveDrawing(drawLayerStack[i]);
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

function moveDrawing(controlP) {
    let startX;
    let startY;
    let endX;
    let endY;
    let x = 0;
    let y = 0;
    mouseIsDown = false;
    let controlBoxTouched = false;

    controlP.controlBox.addEventListener("mousedown", function(e) {
        let disable = checkForLockStatus(controlP.controlBox);
        if (disable) {
            userModesDrawer[3] = false;
        }
        if (userModesDrawer[3]) {
            mouseIsDown = true;
            markSingleLayerOnEdit(controlP);
            x = controlP.controlBox.offsetLeft - e.clientX;
            y = controlP.controlBox.offsetTop - e.clientY;
            startX = controlP.x;
            startY = controlP.y;
            controlBoxTouched = true;
            e.preventDefault();
        }
    }, true);

    window.addEventListener('mouseup', function(e) { 
        if (userModesDrawer[3]) {
            mouseIsDown = false;
            if (controlBoxTouched) {
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
            controlBoxTouched = false;
            window.onmouseup = null;
        }
    }, true);

    controlP.controlBox.addEventListener('mousemove', function(e) {
        if (userModesDrawer[3] && mouseIsDown) { 
            controlP.controlBox.style.left = (e.clientX + x) + "px";
            controlP.controlBox.style.top = (e.clientY + y) + "px"; 
            controlP.x = (e.clientX + x) / pdfState.zoom;
            controlP.y = (e.clientY + y) / pdfState.zoom;
        }
    }, true);
}

// function moveDrawing(controlP) {
//     let startX;
//     let startY;
//     let endX;
//     let endY;
//     clicked = false;
//     short = false;
//     controlP.controlBox.onclick = detectClick;
//     controlP.controlBox.onmousedown = startMovingDrawing;  
    
//     function detectClick() {
//         if (userModesDrawer[3]) {
//             clicked = true;
//             short = true;
//         }
//     }

//     function startMovingDrawing(e) {
//         let disable = checkForLockStatus(controlP.controlBox);
//         if (disable) {
//             userModesDrawer[3] = false;
//         }
//         if (userModesDrawer[3] && !clicked) {
//             mouseIsDown = true;
//             markSingleLayerOnEdit(controlP);
//             x = controlP.controlBox.offsetLeft - e.clientX;
//             y = controlP.controlBox.offsetTop - e.clientY;
//             startX = controlP.x;
//             startY = controlP.y;
//             controlP.controlBox.onmouseup = stopMovingDrawing;
//             controlP.controlBox.onmousemove = movingDrawing;
//         }
//     }

//     function movingDrawing(e) {
//         if (userModesDrawer[3] && mouseIsDown && !clicked) { 
//             controlP.controlBox.style.left = (e.clientX + x) + "px";
//             controlP.controlBox.style.top = (e.clientY + y) + "px"; 
//             controlP.x = (e.clientX + x) / pdfState.zoom;
//             controlP.y = (e.clientY + y) / pdfState.zoom;
//         }
//     }

//     function stopMovingDrawing() {
//         if (userModesDrawer[3] && !clicked && !short) {
//             mouseIsDown = false;
//             endX = controlP.x;
//             endY = controlP.y;
//             let deltaX = endX - startX;
//             let deltaY = endY - startY;
//             let context = controlP.editImg.getContext('2d');  
//             context.clearRect(0, 0, context.canvas.width, context.canvas.height);
//             for (let i = 0; i < controlP.elementToControl.paths.length; i++) {
//                 context.beginPath();  
//                 context.lineCap = "round";
//                 context.lineJoin = "round";       
//                 context.lineWidth = controlP.elementToControl.paths[i][0].line;
//                 context.strokeStyle = controlP.elementToControl.paths[i][0].color;   
//                 context.globalCompositeOperation = controlP.elementToControl.paths[i][0].compositeOp;
//                 controlP.elementToControl.paths[i][0].x = controlP.elementToControl.paths[i][0].x + deltaX;
//                 controlP.elementToControl.paths[i][0].y = controlP.elementToControl.paths[i][0].y + deltaY;
//                 context.moveTo(controlP.elementToControl.paths[i][0].x, controlP.elementToControl.paths[i][0].y);                
//                 for (let j = 1; j < controlP.elementToControl.paths[i].length; j++) {
//                     controlP.elementToControl.paths[i][j].x = controlP.elementToControl.paths[i][j].x + deltaX;
//                     controlP.elementToControl.paths[i][j].y = controlP.elementToControl.paths[i][j].y + deltaY;
//                     context.lineTo(controlP.elementToControl.paths[i][j].x, controlP.elementToControl.paths[i][j].y);
//                 }
//                 context.stroke();
//             }
//             zoomDrawing(controlP, pdfState.zoom, pdfState.zoom);
//             rotateDrawing(controlP, controlP.elementToControl.rotation);   
//             controlP.controlBox.onmouseup = null;
//             controlP.controlBox.onmousemove = null;
//             controlP.controlBox.onclick = null;
//         }
//     }
// }


let pencilsizeInput = document.querySelector("#pencilsize");

document.getElementById('applypencilsize').addEventListener("click", function() {
    resetAllModes();
    let successValue = convertInputToSucess(pencilsizeInput.value, 0.1, 500, true, false);
    if (successValue !== -1000) {
        pencilSize = successValue;
    }
}, false);


colorPickerPencil.on('change', function(color) {
    let red = color.r;
    let green = color.g;
    let blue = color.b;
    let alpha = color.a;
    colorPickerValue = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
});

document.getElementById('applypencilcolor').addEventListener("click", function() {
    resetAllModes();
    pencilColor = colorPickerValue;
    eraserColor = colorPickerValue;
}, false);


let scaleInputFieldWidthDraw = document.getElementById("scale_width_draw");
let scaleInputFieldHeightDraw = document.getElementById("scale_height_draw");

document.getElementById("scaleDraw").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesDrawer[4] = true;
        for (let i = 0; i < drawLayerStack.length; i++) {
            drawLayerStack[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(drawLayerStack[i].controlBox);
                if (disable) {
                    userModesDrawer[4] = false;
                }
                if (userModesDrawer[4]) {
                    zoomDrawing(drawLayerStack[i], pdfState.zoom, pdfState.zoom);
                    scalingDrawing(drawLayerStack[i]);
                    rotateDrawing(drawLayerStack[i], drawLayerStack[i].elementToControl.rotation);
                    markSingleLayerOnEdit(drawLayerStack[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "drawing") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                zoomDrawing(drawLayerStack[index], pdfState.zoom, pdfState.zoom);
                scalingDrawing(drawLayerStack[index]);
                rotateDrawing(drawLayerStack[index], drawLayerStack[index].elementToControl.rotation);
            }
        }
    }
}, false);

function scalingDrawing(controlP) {
    let successValueW = convertInputToSucess(scaleInputFieldWidthDraw.value, 0.1, 20.0, false, true);
    let successValueH = convertInputToSucess(scaleInputFieldHeightDraw.value, 0.1, 20.0, false, true);
    if (successValueW !== -1000 && successValueH !== -1000) {
        let scaleWidth = successValueW;
        let scaleHeight = successValueH;
        let context = controlP.editImg.getContext("2d");
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);  
        context.save();
        if (userModesDrawer[0]) {
            context.globalCompositeOperation = 'source-over';
        } else if (userModesDrawer[1]) {
            context.globalCompositeOperation = 'destination-out';
        } 
        for (let i = 0; i < controlP.elementToControl.paths.length; i++) {
            context.beginPath();  
            context.lineCap = "round";
            context.lineJoin = "round";       
            context.lineWidth = controlP.elementToControl.paths[i][0].line;
            context.strokeStyle = controlP.elementToControl.paths[i][0].color;   
            context.globalCompositeOperation = controlP.elementToControl.paths[i][0].compositeOp;
            let priorX = controlP.elementToControl.paths[i][0].x;
            let scaleX = controlP.elementToControl.paths[i][0].x * scaleWidth;
            let priorY = controlP.elementToControl.paths[i][0].y;
            let scaleY = controlP.elementToControl.paths[i][0].y * scaleHeight;
            let translateX = Math.abs(scaleX - priorX);
            let translateY = Math.abs(scaleY - priorY);
            context.moveTo(priorX, priorY);                
            for (let j = 1; j < controlP.elementToControl.paths[i].length; j++) {
                scaleX = controlP.elementToControl.paths[i][j].x * scaleWidth;
                scaleY = controlP.elementToControl.paths[i][j].y * scaleHeight;
                if (scaleWidth >= 1.0 && scaleHeight >= 1.0) {
                    controlP.elementToControl.paths[i][j].x = Math.abs(scaleX - translateX);
                    controlP.elementToControl.paths[i][j].y = Math.abs(scaleY - translateY);
                    context.lineTo(controlP.elementToControl.paths[i][j].x, controlP.elementToControl.paths[i][j].y);
                } else if (scaleWidth < 1.0 && scaleHeight < 1.0) {
                    controlP.elementToControl.paths[i][j].x = scaleX + translateX;
                    controlP.elementToControl.paths[i][j].y = scaleY + translateY;
                    context.lineTo(controlP.elementToControl.paths[i][j].x, controlP.elementToControl.paths[i][j].y);
                } else if (scaleWidth >= 1.0 && scaleHeight < 1.0) {
                    controlP.elementToControl.paths[i][j].x = Math.abs(scaleX - translateX);
                    controlP.elementToControl.paths[i][j].y = scaleY + translateY;
                    context.lineTo(controlP.elementToControl.paths[i][j].x, controlP.elementToControl.paths[i][j].y);
                } else if (scaleWidth < 1.0 && scaleHeight >= 1.0) {
                    controlP.elementToControl.paths[i][j].x = scaleX + translateX;
                    controlP.elementToControl.paths[i][j].y = Math.abs(scaleY - translateY);
                    context.lineTo(controlP.elementToControl.paths[i][j].x, controlP.elementToControl.paths[i][j].y);
                }
            }
            context.stroke();
        }
        context.restore();
    }
}


let drawRotationSelector = document.querySelector('#rotatedrawsel');
let drawRotationInput = document.querySelector('#drawrotation_input');

drawRotationSelector.addEventListener('change', function() {
    rotateDrawSelectorTriggered = true;
    rotateDrawInputFieldTriggered = false;
}, false);

drawRotationInput.addEventListener('input', function() {
    rotateDrawSelectorTriggered = false;
    rotateDrawInputFieldTriggered = true;
}, false);

document.getElementById("applydrawrotation").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesDrawer[5] = true;
        for (let i = 0; i < drawLayerStack.length; i++) {
            drawLayerStack[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(drawLayerStack[i].controlBox);
                if (disable) {
                    userModesDrawer[5] = false;
                }
                if (userModesDrawer[5]) {
                    let successValue;
                    if (rotateDrawSelectorTriggered) {
                        successValue = convertInputToSucess(drawRotationSelector.value, -360, 360, true, false);
                    } else if (rotateDrawInputFieldTriggered) {
                        successValue = convertInputToSucess(drawRotationInput.value, -360, 360, true, false);
                    }
                    if (successValue === 360 || successValue === -360) {
                        successValue = 0;
                    }
                    if (successValue !== -1000) {
                        zoomDrawing(drawLayerStack[i], pdfState.zoom, pdfState.zoom);
                        rotateDrawing(drawLayerStack[i], successValue);    
                        markSingleLayerOnEdit(drawLayerStack[i]);
                    }
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "drawing") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                let successValue;
                    if (rotateDrawSelectorTriggered) {
                        successValue = convertInputToSucess(drawRotationSelector.value, -360, 360, true, false);
                    } else if (rotateDrawInputFieldTriggered) {
                        successValue = convertInputToSucess(drawRotationInput.value, -360, 360, true, false);
                    }
                    if (successValue === 360 || successValue === -360) {
                        successValue = 0;
                    }
                    if (successValue !== -1000) {
                        zoomDrawing(drawLayerStack[index], pdfState.zoom, pdfState.zoom);
                        rotateDrawing(drawLayerStack[index], successValue);    
                    }
            }
        }
    }
}, false);

function rotateDrawing(controlP, rotationAngle) {
    controlP.elementToControl.rotation = rotationAngle;
    
    if (rotationAngle != 0)
        controlP.elementToControl.wasRotated = true;
    else 
        controlP.elementToControl.wasRotated = false;

    let context = controlP.editImg.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);  
    if (userModesDrawer[0]) {
        context.globalCompositeOperation = 'source-over';
    } else if (userModesDrawer[1]) {
        context.globalCompositeOperation = 'destination-out';
    } 
    let rotCenterX = controlP.x;
    let rotCenterY = controlP.y;
    context.translate(rotCenterX, rotCenterY);
    context.rotate(rotationAngle * Math.PI / 180);
    for (let i = 0; i < controlP.elementToControl.paths.length; i++) {
        context.beginPath();  
        context.lineCap = "round";
        context.lineJoin = "round";       
        context.lineWidth = controlP.elementToControl.paths[i][0].line;
        context.strokeStyle = controlP.elementToControl.paths[i][0].color;   
        context.globalCompositeOperation = controlP.elementToControl.paths[i][0].compositeOp;
        context.moveTo(controlP.elementToControl.paths[i][0].x - rotCenterX, controlP.elementToControl.paths[i][0].y - rotCenterY);                 
    
        for (let j = 1; j < controlP.elementToControl.paths[i].length; j++)
            context.lineTo(controlP.elementToControl.paths[i][j].x - rotCenterX, controlP.elementToControl.paths[i][j].y - rotCenterY);
    
        context.stroke();
    }
    context.resetTransform();
}


document.getElementById('cleardrawing').addEventListener("click", function() {
    resetAllModes();
    for (let i = drawLayerStack.length-1; i >= 0; i--) {
        let disable = checkForLockStatus(drawLayerStack[i].controlBox);
        if (!disable) {
            let deleteIndex = parseInt(drawLayerStack[i].controlBox.getAttribute('data-index'));
            let deletePage = parseInt(drawLayerStack[i].controlBox.getAttribute("data-page"));
            deleteDrawing(drawLayerStack[i].controlBox, deletePage, deleteIndex);
            deleteLayerByElement(deletePage, deleteIndex, "drawing");
        }
    }
}, false);