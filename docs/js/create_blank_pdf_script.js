const { PDFDocument } = PDFLib


let blankNumOfPagesCount = 1;
let blankPageWidth = 210;
let blankPageHeight = 297;
let triggerSaveBlank = false;

const canceler = Vue.createApp({
    data() {
        return {
            blankPDFfilename: "blank_pdf"
        }
    },
    mounted() {
        initialiseBlankEvents();
    },
    methods: {
        async savePDF() {
            blankSaveInput();
            if (triggerSaveBlank) {
                let pdfDoc = await PDFDocument.create()
                let page;
                const pageWFactor = (blankPageWidth * 1000) / 352.8;
                const pageHFactor = (blankPageHeight * 1000) / 352.8;
    
                for (let i = 0; i < blankNumOfPagesCount; i++) {
                    page = pdfDoc.addPage()
                    page.setMediaBox(0, 0, pageWFactor, pageHFactor)
                }
                const pdfBytes = await pdfDoc.save();
                download(pdfBytes, this.blankPDFfilename, "application/pdf");
            }
        },
        setFilename() {
            let inputFilename = document.getElementById("blank_filename").value;
            if (inputFilename.length > 50) {
                inputFilename = inputFilename.substring(0, 50);
                document.getElementById("blank_filename").value = inputFilename;
            }
            this.blankPDFfilename = inputFilename;
        }
    }
});

canceler.mount('#create_blank_app');


function blankSaveInput() {
    let triggerSaveA = false;
    let triggerSaveB = false;
    let triggerSaveC = false;
    blankNumOfPagesCount = document.getElementById('blank_pages').value;
    while (blankNumOfPagesCount.search(" ") > -1) {
        blankNumOfPagesCount = blankNumOfPagesCount.replace(" ", "");
    }
    if (!isNaN(blankNumOfPagesCount)) {
        blankNumOfPagesCount = Number(blankNumOfPagesCount);
        if (Number.isInteger(blankNumOfPagesCount)) {
            document.getElementById('blank_pages').value = blankNumOfPagesCount;
            triggerSaveA = true;
        } else {
            triggerSaveA = false;
        }
    } else {
        triggerSaveA = false;
    }
    blankPageWidth = document.getElementById('blank_width').value;
    while (blankPageWidth.search(" ") > -1) {
        blankPageWidth = blankPageWidth.replace(" ", "");
    }
    if (!isNaN(blankPageWidth)) {
        document.getElementById('blank_width').value = parseInt(blankPageWidth);
        triggerSaveB = true;
    } else {
        triggerSaveB = false;
    }
    blankPageHeight = document.getElementById('blank_height').value;
    while (blankPageHeight.search(" ") > -1) {
        blankPageHeight = blankPageHeight.replace(" ", "");
    }
    if (!isNaN(blankPageHeight)) {
        document.getElementById('blank_height').value = parseInt(blankPageHeight);
        triggerSaveC = true;
    } else {
        triggerSaveC = false;
    }
    if (triggerSaveA && triggerSaveB && triggerSaveC) {
        triggerSaveBlank = true;
    } else {
        triggerSaveBlank = false;
    }
}

function initialiseBlankEvents() {
    restrictInputValues('blank_pages', 1, 3000, true, false);
    restrictInputValues('blank_width', 10, 10000, true, false);
    restrictInputValues('blank_height', 10, 10000, true, false);
    document.getElementById('blank_pages').value = 1;
    document.getElementById('blank_width').value = 210;
    document.getElementById('blank_height').value = 297;
    const dinaSelector = document.querySelector('#dinasize');
    dinaSelector.selectedIndex = 3;
    const portraitRadio = document.getElementById('portrait');
    portraitRadio.checked = true;
    const landscapeRadio = document.getElementById('landscape');
    landscapeRadio.checked = false;
    const quadraticRadio = document.getElementById('quadratic');
    quadraticRadio.checked = false;
    dinaSelector.addEventListener('click', function() {
        const dinaSizes = setDINAFormats(dinaSelector.selectedIndex);
        blankPageWidth = dinaSizes[1];
        blankPageHeight = dinaSizes[0];
        document.getElementById('blank_width').value = dinaSizes[1];
        document.getElementById('blank_height').value = dinaSizes[0];
        if (document.getElementById('portrait').checked) {
            blankPageWidth = dinaSizes[0];
            blankPageHeight = dinaSizes[1];
            document.getElementById('blank_width').value = dinaSizes[0];
            document.getElementById('blank_height').value = dinaSizes[1];
        }
    }, false);
    portraitRadio.addEventListener('click', function() {
        let width = convertInputToSucess(document.getElementById('blank_width').value, 10, 10000, true, false);
        let height = convertInputToSucess(document.getElementById('blank_height').value, 10, 10000, true, false);
        if (width !== -1000 && height !== -1000 && width > height) {
            blankPageWidth = height;
            blankPageHeight = width;
            document.getElementById('blank_width').value = height;
            document.getElementById('blank_height').value = width;
        }
    }, false);
    landscapeRadio.addEventListener('click', function() {
        let width = convertInputToSucess(document.getElementById('blank_width').value, 10, 10000, true, false);
        let height = convertInputToSucess(document.getElementById('blank_height').value, 10, 10000, true, false);
        if (width !== -1000 && height !== -1000 && width < height) {
            blankPageWidth = height;
            blankPageHeight = width;
            document.getElementById('blank_width').value = height;
            document.getElementById('blank_height').value = width;
        }
    }, false);
    quadraticRadio.addEventListener('click', function() {
        let width = convertInputToSucess(document.getElementById('blank_width').value, 10, 10000, true, false);
        if (width !== -1000) {
            blankPageWidth = width;
            blankPageHeight = width;
            document.getElementById('blank_width').value = width;
            document.getElementById('blank_height').value = width;
        }
    }, false);
}


function setDINAFormats(dinaID) {
    let dinaSizes = [];
    let w = 0;
    let h = 0;
    switch(dinaID) {
        case 0:
            w = 594;
            h = 841;
            break;
        case 1:
            w = 420;
            h = 594;
            break;
        case 2:
            w = 297;
            h = 420;
            break;
        case 3:
            w = 210;
            h = 297;
            break;
        case 4:
            w = 148;
            h = 210;
            break;
        case 5:
            w = 105;
            h = 148;
            break;
        case 6:
            w = 74;
            h = 105;
            break;
        default:
            w = 210;
            h = 297;
    }
    dinaSizes[0] = w;
    dinaSizes[1] = h;
    return dinaSizes;
}
