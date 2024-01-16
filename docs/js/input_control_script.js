function restrictInputValues(inputId, min, max, parseIntOperation, parseFloatOperation) {
    const inputElem = document.getElementById(inputId);
    let valToRestrict;
    inputElem.addEventListener('change', function() {
        valToRestrict = inputElem.value;
        valToRestrict = valToRestrict.replace(/\s+/g,'');
        document.getElementById(inputId).value = valToRestrict;
        if (valToRestrict.match(/^-?\d+$/) || valToRestrict.match(/^\d+\.\d+$/)) {
            if (parseIntOperation) {
                valToRestrict = parseInt(valToRestrict);
                document.getElementById(inputId).value = valToRestrict;
            } 
            if (parseFloatOperation) {
                valToRestrict = parseFloat(valToRestrict);
            }
            if (valToRestrict >= min && valToRestrict <= max) {
                document.getElementById(inputId).value = valToRestrict;
            } else {
                if (valToRestrict < min) {
                    document.getElementById(inputId).value = min;
                } else if (valToRestrict > max) {
                    document.getElementById(inputId).value = max;
                }
            }
        }
    }, false);
}

function convertInputToSucess(input, min, max, parseIntOperation, parseFloatOperation) {
    let outputVal = input;

    // valid positive/negative integer or valid float
    if (outputVal.match(/^-?\d+$/) || outputVal.match(/^\d+\.\d+$/)) {
        if (parseIntOperation) {
            outputVal = parseInt(outputVal);
        } 
        if (parseFloatOperation) {
            outputVal = parseFloat(outputVal);
        }
        if (!(outputVal >= min && outputVal <= max)) {
            outputVal = -1000;
        } 
    } else {
        outputVal = -1000;
    }
    return outputVal;
}