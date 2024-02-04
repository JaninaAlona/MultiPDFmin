const { PDFDocument } = PDFLib

let selectedPDFBytes;
let splittedPDFs = [];
let splitMethod = 0;
let pdfToSplit;
let pdfBytesList = [];
let splitPDFfilename = "";

const splitter = Vue.createApp({
    data() {
        return {
            maxPages: 100,
            outputname: '',
            isEncrypted: false
        }
    },
    methods: {
        selectFile(e) {
            let encryptedErrorWidgets = document.getElementsByClassName("encrypted_error");
            for (let i = 0; i < encryptedErrorWidgets.length; i++) {
                encryptedErrorWidgets[i].style.display = "none";
            }
            let noPDFErrorWidgets = document.getElementsByClassName("no_pdf_error");
            for (let i = 0; i < noPDFErrorWidgets.length; i++) {
                noPDFErrorWidgets[i].style.display = "none";
            }
            pdfBytesList = [];
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                selectedPDFBytes = new Uint8Array(this.result);
                this.isEncrypted = false;
                if (file.name.endsWith(".pdf")) {
                    let srcPDFDoc;
                    try {
                        srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
                    } catch(encryptedErr) {
                        this.isEncrypted = true;
                        encryptedErrorWidgets = document.getElementsByClassName("encrypted_error");
                        for (let i = 0; i < encryptedErrorWidgets.length; i++) {
                            encryptedErrorWidgets[i].style.display = "flex";
                        }
                    }
                    if (!this.isEncrypted && srcPDFDoc.getPages().length <= 5000) {
                        if (srcPDFDoc.getPages().length === 1) {
                            document.getElementById('split_after').disabled = true;
                        } else {
                            pdfToSplit = file.name;
                            if (pdfToSplit.length > 54) {
                                pdfToSplit = pdfToSplit.substring(0, 50).concat(pdfToSplit.substring(pdfToSplit.length-4, pdfToSplit.length));
                            }
                            document.getElementById("fileselected").innerText = pdfToSplit;
                            document.getElementById("maxSplitP").innerText = srcPDFDoc.getPages().length;
                            document.getElementById('split_after').disabled = false;
                        }
                    }
                } else {
                    noPDFErrorWidgets = document.getElementsByClassName("no_pdf_error");
                    for (let i = 0; i < noPDFErrorWidgets.length; i++) {
                        noPDFErrorWidgets[i].style.display = "flex";
                    }
                }
            }
            if (file)
                fileReader.readAsArrayBuffer(file);
        },
        selectRegularSplit(regularSplitOpt) {
            splitMethod = regularSplitOpt;
            switch(regularSplitOpt) {
                case 0:
                    document.getElementsByClassName('splitlist')[0].disabled = true;
                    document.getElementById('save_split').disabled = true;
                    break;
                case 1:
                    document.getElementsByClassName('splitlist')[0].disabled = true;
                    document.getElementById('save_split').disabled = false;
                    document.getElementById('save_split').classList.add("enable_filename");
                    this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                    splitPDFfilename = this.outputName +  '_split';
                    document.getElementById("split_filename").value = splitPDFfilename;
                    break;
                case 2:
                    document.getElementsByClassName('splitlist')[0].disabled = true;
                    document.getElementById('save_split').disabled = false;
                    document.getElementById('save_split').classList.add("enable_filename");
                    this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                    splitPDFfilename = this.outputName +  '_split';
                    document.getElementById("split_filename").value = splitPDFfilename;
                    break;
                case 3:
                    document.getElementsByClassName('splitlist')[0].disabled = true;
                    document.getElementById('save_split').disabled = false;
                    document.getElementById('save_split').classList.add("enable_filename");
                    this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                    splitPDFfilename = this.outputName +  '_split';
                    document.getElementById("split_filename").value = splitPDFfilename;
                    break;
                case 4:
                    document.getElementsByClassName('splitlist')[0].disabled = false;
                    document.getElementById('save_split').disabled = false;
                    document.getElementById('save_split').classList.add("enable_filename");
                    this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                    splitPDFfilename = this.outputName +  '_split';
                    document.getElementById("split_filename").value = splitPDFfilename;
                    break;
            }
        },
        setFilename() {
            let inputFilename = document.getElementById("split_filename").value;
            if (inputFilename.length > 50) {
                inputFilename = inputFilename.substring(0, 50);
                document.getElementById("split_filename").value = inputFilename;
            }
            splitPDFfilename = inputFilename;
        },
        async saveSplittedPDFs() {
            const startSplit = performance.now();
            await computeSplitOptions();
            if (splittedPDFs.length > 0) {
                for(let i = 0; i < splittedPDFs.length; i++) {
                    const pdfBytes = await splittedPDFs[i].save();
                    pdfBytesList.push(pdfBytes);
                }
                compressMultipleToZip(pdfBytesList, splitPDFfilename).then(function(blob) {
                    console.log("compressed to ZIP");
                    return downloadPDF(blob, splitPDFfilename);
                }).then(function(step) {
                    console.log(step);
                    console.log("finished");
                    const endSplit = performance.now();
                    console.log(`Execution time of Merger: ${endSplit - startSplit} ms`);
                });
                splittedPDFs = [];
                pdfBytesList = [];
            }
        }
    }
});

splitter.mount('#split_app');


async function computeSplitOptions() {
    switch(splitMethod) {
        case 1:
            await applySplitAfterEvery();
            break;
        case 2:
            await splitAfter(1);
            break;
        case 3:
            await splitAfter(0);
            break;
        case 4:
            await splitList();
            break;
    }
}


async function applySplitAfterEvery() {
    let srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
    for(let i = 0; i < srcPDFDoc.getPages().length; i++) {
        let newPDFDoc = await PDFDocument.create();
        let newPage = await newPDFDoc.copyPages(srcPDFDoc, [i]);
        const [currentPage] = newPage;
        newPDFDoc.addPage(currentPage);
        splittedPDFs.push(newPDFDoc);
    }
}

async function splitAfter(nRest) {
    const srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
    if (nRest == 0 && srcPDFDoc.getPages().length >= 3) {
        for (let i = 0; i < srcPDFDoc.getPages().length - 1; i+=2) {  
            const newPDFDoc = await PDFDocument.create();   
            const [currentPage] = await newPDFDoc.copyPages(srcPDFDoc, [i]);
            const [secondPage] = await newPDFDoc.copyPages(srcPDFDoc, [i+1]);
            newPDFDoc.addPage(currentPage);
            newPDFDoc.addPage(secondPage);
            splittedPDFs.push(newPDFDoc);
        }
        if (srcPDFDoc.getPages().length % 2 == 1) {
            const newPDFDoc = await PDFDocument.create(); 
            const [lastPage] = await newPDFDoc.copyPages(srcPDFDoc, [srcPDFDoc.getPages().length-1]);
            newPDFDoc.addPage(lastPage);
            splittedPDFs.push(newPDFDoc);
        }
    } else {
        document.getElementById('save_split').disabled = true;
    } 
    if (nRest == 1 && srcPDFDoc.getPages().length >= 2) {
        let newPDFDoc = await PDFDocument.create();
        const [firstPage] = await newPDFDoc.copyPages(srcPDFDoc, [0]);
        newPDFDoc.addPage(firstPage);
        splittedPDFs.push(newPDFDoc);
        if (srcPDFDoc.getPages().length === 2) {
            let newPDFDoc = await PDFDocument.create();
            const [lastPage] = await newPDFDoc.copyPages(srcPDFDoc, [1]);
            newPDFDoc.addPage(lastPage);
            splittedPDFs.push(newPDFDoc);
        }
        for (let i = 1; i < srcPDFDoc.getPages().length - 1; i+=2) {
            let newPDFDoc = await PDFDocument.create();
            const [currentPage] = await newPDFDoc.copyPages(srcPDFDoc, [i]);
            const [secondPage] = await newPDFDoc.copyPages(srcPDFDoc, [i+1]);
            newPDFDoc.addPage(currentPage);
            newPDFDoc.addPage(secondPage);
            splittedPDFs.push(newPDFDoc);
        }
    } else {
        document.getElementById('save_split').disabled = true;
    } 
}

async function splitList() {
    let srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
    let splitListDoc;
    let trimmedPages = convertPageListToSucess('splitlist', srcPDFDoc.getPages().length-1);
    if (trimmedPages.length > 0) {
        let start = 1;
        let end = trimmedPages[0];
        for (let i = 0; i < trimmedPages.length; i++) {
            splitListDoc = await PDFDocument.create();
            for (let j = start; j <= end; j++) {
                const [currentPage] = await splitListDoc.copyPages(srcPDFDoc, [j-1]);
                splitListDoc.addPage(currentPage);
            } 
            start = trimmedPages[i] + 1;
            end = trimmedPages[i+1];
            splittedPDFs.push(splitListDoc);
        } 
        splitListDoc = await PDFDocument.create();
        for (let i = trimmedPages[trimmedPages.length-1] + 1; i <= srcPDFDoc.getPages().length; i++) {
            const [currentPage] = await splitListDoc.copyPages(srcPDFDoc, [i-1]);
            splitListDoc.addPage(currentPage);
        } 
        splittedPDFs.push(splitListDoc); 
    }
}