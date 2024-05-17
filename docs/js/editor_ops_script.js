/**
 * MultiPDFmin
 * github: https://github.com/JaninaAlona/MultiPDFmin
 * Website: https://janinaalona.github.io/MultiPDFmin/
 * @author Janina Schroeder
 * @version 2.0.0
 * @description Editor all-element operations
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3 (https://github.com/JaninaAlona/MultiPDFmin/blob/main/LICENSE)
 */


const deleteOps = document.getElementsByClassName("delete_op");

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