/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 2.0.0
 * @description Shaper functions
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */



let shape = {
    context: null,
    type: "",
    x: 0,
    y: 0,
    xp2: 50,
    yp2: 50,
    width: 100,
    height: 100,
    stroke: 'rgba(0,0,0,1.0)',
    strokeWidth: 3,
    fill: '',
    useFill: false,
    useStroke: false,
    rotation: 0,
    page: 1,
    drawShape() {
        if(this.type === "rectangle") {
            let rectCenterX = this.x + this.width / 2;
            let rectCenterY = this.y + this.height / 2;
            this.context.save();
            this.context.beginPath();
            this.context.translate(rectCenterX, rectCenterY);
            this.context.rotate(this.rotation * Math.PI / 180);
            this.context.translate(-rectCenterX, -rectCenterY);
            if (this.useFill) 
                this.context.fillStyle = this.fill;
            if (this.useStroke) {
                this.context.strokeStyle = this.stroke;
                this.context.lineWidth   = this.strokeWidth;
            }
            if (this.useFill) {
                this.context.fillRect(this.x, this.y, this.width, this.height);
            }
            if (this.useStroke) {
                this.context.strokeRect(this.x, this.y, this.width, this.height);
            }
            this.context.restore();
        } else if (this.type === "triangle") {
            let triCenterX = this.x + this.width / 2;
            let triCenterY = this.y + this.height / 2;
            this.context.save();
            this.context.beginPath();
            this.context.translate(triCenterX, triCenterY);
            this.context.rotate(this.rotation * Math.PI / 180);
            this.context.translate(-triCenterX, -triCenterY);
            this.context.moveTo(this.x, this.y);
            this.context.lineTo(this.x, this.y + this.height);
            this.context.lineTo(this.x + this.xp2 + this.width, this.y + this.yp2);
            this.context.closePath();

            if (this.useFill) 
                this.context.fillStyle = this.fill;

            if (this.useStroke) {
                this.context.strokeStyle = this.stroke;
                this.context.lineWidth   = this.strokeWidth;
            }
            
            if (this.useFill) 
                this.context.fill();
            
            if (this.useStroke)    
                this.context.stroke();
            
            this.context.restore();
        } else if (this.type === "circle") {
            this.context.beginPath();
            this.context.ellipse(this.x, this.y, this.width / 2, this.height / 2, this.rotation * Math.PI / 180, 0, 2 * Math.PI);
            
            if (this.useFill) {
                this.context.fillStyle = this.fill;
            }
            if (this.useStroke) {
                this.context.strokeStyle = this.stroke;
                this.context.lineWidth   = this.strokeWidth;
            }   
            this.context.closePath();
            if (this.useFill) {
                this.context.fill();
            }
            if (this.useStroke)    
                this.context.stroke();
        }
    }
}

let shapeControllerPoint = {
    controlBox: null,
    editImg: null,
    elementToControl: null,
    type: '',
    layer: null,
    page: 1, 
    x: 0,
    y: 0,
    index: 0, 
    rotation: 0,
    originX: 0,
    originY: 0,
    setControlPoint() {
        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = this.x + "px";
        div.style.top = this.y + "px";
        div.setAttribute('data-page', this.layer.getAttribute("data-write"));
        div.setAttribute('data-index', this.index);
        div.classList.add("shape");
        div.classList.add("box");
        this.controlBox = div;
    },
    rotateControlPoint() {
        this.controlBox.style.marginLeft = this.originX + "px";
        this.controlBox.style.marginTop = this.originY + "px";
        this.controlBox.style.transform = "rotate(" + this.rotation + "deg)";
    }
}

const colorPickerStroke = new Alwan('#colorpicker_stroke', {
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

const colorPickerFill = new Alwan('#colorpicker_fill', {
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

let shapeControllerPointCounter = 0;
let userStrokeColor = 'rgba(0,0,0,1.0)';
let userFillColor = 'rgba(0,0,0,1.0)';
let rotateShapeSelectorTriggered = false;
let rotateShapeInputFieldTriggered = false;
const scaleInputFieldWidth = document.getElementById("scale_width");
const scaleInputFieldHeight = document.getElementById("scale_height");
const strokeCheckbox = document.getElementById("stroke");
const fillCheckbox = document.getElementById("fill");
const shapeRotationSelector = document.querySelector('#rotateshapesel');
const shapeRotationInput = document.querySelector('#shaperotation_input');
const addRects = document.getElementsByClassName("addRect");
const addTriangles = document.getElementsByClassName("addTriangle");
const addEllipses = document.getElementsByClassName("addEllipse");


function updateUserShapeLayer(controlP) {
    const ctx = controlP.editImg.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const currentShape = controlP.elementToControl;
    currentShape.context = ctx;
    currentShape.drawShape();
}


for (let s = 0; s < addRects.length; s++) {
    addRects[s].addEventListener("click", function() {
        resetAllModes();
        userModesGeometry[0] = true;
        addShape("rectangle");      
    }, false);
}

for (let s = 0; s < addTriangles.length; s++) {
    addTriangles[s].addEventListener("click", function() {
        resetAllModes();
        userModesGeometry[1] = true;
        addShape("triangle");    
    }, false);
}

for (let s = 0; s < addEllipses.length; s++) {
    addEllipses[s].addEventListener("click", function() {
        resetAllModes();
        userModesGeometry[2] = true;
        addShape("circle");    
    }, false);
}

function addShape(shapeType) {
    for(let i = 0; i < writeLayerStack.length; i++) {
        writeLayerStack[i].onclick = function(e) {
            addingShape(e, writeLayerStack[i], shapeType);
        }
    }
}

function addingShape(event, writeLayer, shapeType) {
    if (userModesGeometry[0] || userModesGeometry[1] || userModesGeometry[2]) {
        const currentShape = Object.create(shape);
        const shapeControllerP = Object.create(shapeControllerPoint);
        let page = parseInt(writeLayer.getAttribute("data-write"), 10);
        currentShape.type = shapeType;
        if (shapeType === "triangle") {
            currentShape.xp2 = 50;
            currentShape.yp2 = 50;
        }
        currentShape.width = 100;
        currentShape.height = 100;
        currentShape.strokeWidth = 3;
        currentShape.stroke = 'rgba(0,0,0,1.0)';
        currentShape.fill = '';
        currentShape.useFill = false;
        currentShape.useStroke = true;
        currentShape.rotation = 0;
        currentShape.page = page;   
        shapeControllerP.elementToControl = currentShape;
        shapeControllerP.type = "shape";
        shapeControllerP.layer = writeLayer;
        shapeControllerP.page = page;
        shapeControllerP.index = shapeControllerPointCounter;
        shapeControllerP.rotation = 0;
        geometryPointsList.push(shapeControllerP);
        shapeControllerPointCounter++;
        createUserShapeLayer(event, "shape", page, shapeControllerP, writeLayer);
        zoomGeometry(shapeControllerP);
    }
}

function createUserShapeLayer(event, editImgClass, thisPage, controlP, writeLayer) {
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
    controlP.editImg = canvasContainer;
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
    let rect = canvasContainer.getBoundingClientRect();
    let mousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const ctx = canvasContainer.getContext("2d");
    const currentShape = controlP.elementToControl;
    currentShape.context = ctx;
    if (currentShape.type === "rectangle" || currentShape.type === "triangle") {
        currentShape.x = (mousePos.x - (currentShape.width * pdfState.zoom)/2 + 20) / pdfState.zoom;
        currentShape.y = (mousePos.y - (currentShape.height * pdfState.zoom)/2 + 20) / pdfState.zoom;
    } else if (currentShape.type === "circle") {
        currentShape.x = (mousePos.x + 20)/pdfState.zoom;
        currentShape.y = (mousePos.y + 20)/pdfState.zoom;
    }
    controlP.x = mousePos.x;
    controlP.y = mousePos.y;
    controlP.setControlPoint();
    controlP.x = mousePos.x/pdfState.zoom;
    controlP.y = mousePos.y/pdfState.zoom;
    writeLayer.querySelectorAll("div.control_group")[0].appendChild(controlP.controlBox);
    createStackLayer(thisPage, editImgClass, controlP.index);
}


document.getElementById("scaleShape").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[5] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[5] = false;
                }
                if (userModesGeometry[5]) {
                    scalingShape(geometryPointsList[i], true);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                scalingShape(geometryPointsList[index], true);
            }
        }
    }
}, false);

function scalingShape(controlP, differentWH) { 
    let triggerScaleW = false;
    let triggerScaleH = false;
    const currentShape = controlP.elementToControl;
    if (differentWH) {
        let successValueW = convertInputToSucess(scaleInputFieldWidth.value, 1, 3000, true, false);
        if (successValueW !== -1000) {
            scaleW = successValueW;
            triggerScaleW = true;
        }
        let successValueH = convertInputToSucess(scaleInputFieldHeight.value, 1, 3000, true, false);
        if (successValueH !== -1000) {
            scaleH = successValueH;
            triggerScaleH = true;
        }
    } else {
        let successValue = convertInputToSucess(scaleByFactorInput.value, 0.1, 200, false, true);
        if (successValue !== -1000) {
            scaleW = currentShape.width * successValue;
            scaleH = currentShape.height * successValue;
            triggerScaleW = true;
            triggerScaleH = true;
        }
    }
    if (triggerScaleW && triggerScaleH) {
        let previousWidth = currentShape.width;
        let previousHeight = currentShape.height;
        const widthChangeFactor = (scaleW * pdfState.zoom) / previousWidth;
        const heightChangeFactor = (scaleH * pdfState.zoom) / previousHeight;
        currentShape.width = scaleW * pdfState.zoom;
        currentShape.height = scaleH * pdfState.zoom;
        if (currentShape.type === "triangle") {
            currentShape.xp2 = currentShape.xp2 * widthChangeFactor;
            currentShape.yp2 = currentShape.yp2 * heightChangeFactor;
        }
        if (currentShape.type === "rectangle" || currentShape.type === "triangle") {
            currentShape.x = (controlP.x - currentShape.width/2 + 20/pdfState.zoom);
            currentShape.y = (controlP.y - currentShape.height/2 + 20/pdfState.zoom);
        } else if (currentShape.type === "circle") {
            currentShape.x = (controlP.x + 20/pdfState.zoom);
            currentShape.y = (controlP.y + 20/pdfState.zoom);
        }
        updateUserShapeLayer(controlP);
    }
}


colorPickerStroke.on('change', function(color) {
    let red = color.r;
    let green = color.g;
    let blue = color.b;
    let alpha = color.a;
    userStrokeColor = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
}, false);

strokeCheckbox.addEventListener("input", function() {
    if (!strokeCheckbox.checked) {
        fillCheckbox.checked = true;
    }
}, false);

document.getElementById("applystrokecolor").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[6] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[6] = false;
                }
                if (userModesGeometry[6]) {
                    setStrokeColor(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                setStrokeColor(geometryPointsList[index]);
            }
        }
    }
}, false);

function setStrokeColor(controlP) {
    if(strokeCheckbox.checked) {
        const currentShape = controlP.elementToControl;
        currentShape.stroke = userStrokeColor;
        currentShape.useStroke = true;
        if (!fillCheckbox.checked) {
            currentShape.useFill = false;
        }
        updateUserShapeLayer(controlP);      
    }
}


const strokeWidthInput = document.querySelector("#strokewidth");

document.getElementById("applystrokewidth").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[7] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[7] = false;
                }
                if (userModesGeometry[7]) {
                    setStrokeWidth(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                setStrokeWidth(geometryPointsList[index]);
            }
        }
    }
}, false);

function setStrokeWidth(controlP) {
    let successValue = convertInputToSucess(strokeWidthInput.value, 0.1, 200, true, false);
    if (successValue !== -1000) {
        const currentShape = controlP.elementToControl;
        if (currentShape.useStroke) { 
            currentShape.strokeWidth = successValue;
            updateUserShapeLayer(controlP);
        }  
    }
}


colorPickerFill.on('change', function(color) {
    let red = color.r;
    let green = color.g;
    let blue = color.b;
    let alpha = color.a;
    userFillColor = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
}, false);

fillCheckbox.addEventListener("input", function() {
    if (!fillCheckbox.checked) {
        strokeCheckbox.checked = true;
    }
}, false);

document.getElementById("applyfillcolor").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[8] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[8] = false;
                }
                if (userModesGeometry[8]) {
                    setFillColor(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                setFillColor(geometryPointsList[index]);
            }
        }
    }
}, false);

function setFillColor(controlP) {
    if(fillCheckbox.checked) {
        const currentShape = controlP.elementToControl;
        currentShape.fill = userFillColor;
        currentShape.useFill = true;
        if (!strokeCheckbox.checked) {
            currentShape.useStroke = false;
        }
        updateUserShapeLayer(controlP);              
    }
}


shapeRotationSelector.addEventListener('change', function() {
    rotateShapeSelectorTriggered = true;
    rotateShapeInputFieldTriggered = false;
}, false);

shapeRotationInput.addEventListener('input', function() {
    rotateShapeSelectorTriggered = false;
    rotateShapeInputFieldTriggered = true;
}, false);

document.getElementById("applyshaperotation").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[9] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[9] = false;
                }
                if (userModesGeometry[9]) {
                    setRotation(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                setRotation(geometryPointsList[index]);
            }
        }
    }
}, false);

function setRotation(controlP) {
    let successValue;
    if (rotateShapeSelectorTriggered) {
        successValue = convertInputToSucess(shapeRotationSelector.value, -360, 360, true, false);
    } else if (rotateShapeInputFieldTriggered) {
        successValue = convertInputToSucess(shapeRotationInput.value, -360, 360, true, false);
    }
    if (successValue === 360 || successValue === -360) {
        successValue = 0;
    }
    if (successValue !== -1000) {
        const currentShape = controlP.elementToControl;
        currentShape.rotation = successValue;
        controlP.rotation = successValue;
        controlP.originX = 0;
        controlP.originY = 0;
        controlP.rotateControlPoint();
        updateUserShapeLayer(controlP);   
    }           
}


const scaleByFactorInput = document.getElementById("scale_factor_geo");

document.getElementById('applyscalegeo').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[10] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[10] = false;
                }
                if (userModesGeometry[10]) {
                    scalingShape(geometryPointsList[i], false);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                scalingShape(geometryPointsList[index], false);
            }
        }
    }
}, false);


const triPointX = document.getElementById("xp2");
const triPointY = document.getElementById("yp2");
document.getElementById("tripoint").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[11] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[11] = false;
                }
                if (userModesGeometry[11]) {
                    setTrianglePoint(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"), 10);
                setTrianglePoint(geometryPointsList[index]);
            }
        }
    }
}, false);

function setTrianglePoint(controlP) {
    let successValueX = convertInputToSucess(triPointX.value, 1, 3000, true, false);
    let successValueY = convertInputToSucess(triPointY.value, 1, 3000, true, false);
    if (successValueX !== -1000 && successValueY !== -1000) {
        const currentShape = controlP.elementToControl;
        if (currentShape.type === "triangle") {
            currentShape.xp2 = successValueX * pdfState.zoom;
            currentShape.yp2 = successValueY * pdfState.zoom;
            updateUserShapeLayer(controlP);
        }
    }
}