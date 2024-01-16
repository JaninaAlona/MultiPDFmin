function restrictInputValues(inputId, min, max, parseIntOperation, parseFloatOperation) {
    const inputElem = document.getElementById(inputId);
    let valToRestrict;
    inputElem.addEventListener('change', function() {
        valToRestrict = inputElem.value;

        //remove white space
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

function convertPageListToSucess(input, numOfPages) {
    let outputPageList = [];
    if (input.indexOf(',') > -1) {
        const pages = input.split(",");
        for (let i = 0; i < pages.length; i++) {
            let singlePage = pages[i];

            //Remove white space
            singlePage = singlePage.replace(/\s+/g,'');
            
            //Check if page is an Integer
            if (singlePage.match(/^-?\d+$/)) {
                singlePage = parseInt(singlePage);
                if (singlePage >= 1 && singlePage <= numOfPages) {
                    outputPageList.push(singlePage);
                } else {
                    outputPageList = [];
                    break;
                }
            } else {
                outputPageList = [];
                break;
            }
        }
    } else {
        let singlePage = input.replace(/\s+/g,'');
        if (singlePage.match(/^-?\d+$/)) {
            singlePage = parseInt(singlePage);
            if (singlePage >= 1 && singlePage <= numOfPages) {
                outputPageList.push(singlePage);
            } else {
                outputPageList = [];
            }
        } else {
            outputPageList = [];
        }
    }
    if (outputPageList.length > 0) {
            
        //remove dublicates in trimmedPages
        outputPageList = outputPageList.filter((value, index) => outputPageList.indexOf(value) === index);

        //sort in ascending order
        outputPageList.sort((a,b) => a-b);  
    }
    return outputPageList;
}