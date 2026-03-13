const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

/**
 * Merges two PDFs by alternating pages from each.
 * @param {string} pdfPath1 - Path to the first PDF.
 * @param {string} pdfPath2 - Path to the second PDF.
 * @param {string} outputPath - Path to save the merged PDF.
 * @returns {Promise<string>} - The path of the output PDF.
 */
async function alternateMerge(pdfPath1, pdfPath2, outputPath) {

    const mergedPdf = await PDFDocument.create();

    const srcData1 = await fs.readFileSync(pdfPath1);
    const srcDoc1 = await PDFDocument.load(srcData1);

    const srcData2 = await fs.readFileSync(pdfPath2);
    const srcDoc2 = await PDFDocument.load(srcData2);

    const srcPages1 = srcDoc1.getPages();
    const srcPages2 = srcDoc2.getPages();

    const copiedPages1 = await mergedPdf.copyPages(srcDoc1, srcDoc1.getPageIndices());
    const copiedPages2 = await mergedPdf.copyPages(srcDoc2, srcDoc2.getPageIndices());

    let srcOffset1 = 0;
    let srcOffset2 = 0;

    for (let i = 0; i < srcPages1.length + srcPages2.length; i++) {
        if (i % 2 === 0) {
            if (srcOffset1 < copiedPages1.length) {
                mergedPdf.addPage(copiedPages1[srcOffset1]);
                srcOffset1++;
            } else if (srcOffset2 < copiedPages2.length) {
                // If doc1 is exhausted, just append from doc2
                mergedPdf.addPage(copiedPages2[srcOffset2]);
                srcOffset2++;
            }
        } else {
            if (srcOffset2 < copiedPages2.length) {
                mergedPdf.addPage(copiedPages2[srcOffset2]);
                srcOffset2++;
            } else if (srcOffset1 < copiedPages1.length) {
                // If doc2 is exhausted, just append from doc1
                mergedPdf.addPage(copiedPages1[srcOffset1]);
                srcOffset1++;
            }
        }
    }


    const outputPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, outputPdfBytes);

    return outputPath;
}

async function alternateMergeAndSavePdfs(pdfPath1, pdfPath2, outputPath) {
    try {
        const fileName = await alternateMerge(pdfPath1, pdfPath2, outputPath);
        console.log('PDFs reversed successfully. Reversed file saved at:', fileName);
        return fileName;
    } catch (error) {
        console.error('Error reversing PDFs:', error);
        throw error;
    }
}



/**
 * Reverses the order of pages in a PDF.
 * @param {string} pdfPath - Path to the PDF to reverse.
 * @param {string} outputPath - Path to save the reversed PDF.
 * @returns {Promise<string>} - The path of the output PDF.
 */
async function reversePdf(pdfPath, outputPath) {

    const reversedPdf = await PDFDocument.create();
    const srcData = await fs.readFileSync(pdfPath);

    const srcDoc = await PDFDocument.load(srcData);

    const srcPages = srcDoc.getPages();

    const pageNumbers = Array(srcPages.length);

    console.log("File to revers" + pageNumbers);

    for (j = 0; j < srcPages.length; j++) {
        pageNumbers[j] = pageNumbers.length - j - 1;
    }


    const copiedPages = await reversedPdf.copyPages(srcDoc, pageNumbers);

    for (i = 0; i < copiedPages.length; i++) {
        reversedPdf.addPage(copiedPages[i]);

    }

    const reversedPdfBytes = await reversedPdf.save();
    fs.writeFileSync(outputPath, reversedPdfBytes);

    return outputPath;
}

async function reversePdfAndSave(pdfPath, outputPath) {
    try {
        const fileName = await reversePdf(pdfPath, outputPath);
        console.log('PDFs reversed successfully. Reversed file saved at:', fileName);
        return fileName;
    } catch (error) {
        console.error('Error reversing PDFs:', error);
        throw error;
    }
}

/**
 * Merges multiple PDFs sequentially.
 * @param {string[]} pdfPaths - Array of paths to PDFs to merge.
 * @param {string} outputPath - Path to save the merged PDF.
 * @returns {Promise<string>} - The path of the output PDF.
 */
async function mergePDFs(pdfPaths, outputPath) {
    const mergedPdf = await PDFDocument.create();

    for (const pdfPath of pdfPaths) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    return outputPath;
}

async function mergeAndSavePDFs(pdfPaths, outputPath) {
    try {
        const mergedFileName = await mergePDFs(pdfPaths, outputPath);
        console.log('PDFs merged successfully. Merged file saved at:', mergedFileName);
        return mergedFileName;
    } catch (error) {
        console.error('Error merging PDFs:', error);
        throw error;
    }
}



module.exports = {
    alternateMerge,
    reversePdf,
    mergePDFs
};

// Check if the script is being run directly from the command line
if (require.main === module) {
    if (process.argv.length < 3) {
        console.log("Options include merge, reverse, altMerge");
        process.exit(1);
    }

    const command = process.argv[2];

    if (command == "merge") {
        // START PROCESS
        if (process.argv.length < 6) {
            console.log("Error with input. Input should be merge, src1PDF, src2PDF, outputPDF");
            process.exit(1);
        }
        const pdfPath1 = process.argv[3];
        const pdfPath2 = process.argv[4];
        const outputPath = process.argv[5];

        mergeAndSavePDFs([pdfPath1, pdfPath2], outputPath)
            .then(fileName => {
                console.log(fileName)
            })
            .catch(error => {
                console.log(error)
            });
    } else if (command == "reverse") {

        if (process.argv.length < 4) {
            console.log("Error with input. Input should be reverse, src1PDF, outputPDF");
            process.exit(1);
        }
        const pdfPath1 = process.argv[3];
        const outputPath = process.argv[4];

        reversePdfAndSave(pdfPath1, outputPath)
            .then(fileName => {
                console.log(fileName)
            })
            .catch(error => {
                console.log(error)
            });

    } else if (command == "altMerge") {
        // START PROCESS
        if (process.argv.length < 6) {
            console.log("Error with input. Input should be altMerge, src1PDF, src2PDF, outputPDF");
            process.exit(1);
        }
        const pdfPath1 = process.argv[3];
        const pdfPath2 = process.argv[4];
        const outputPath = process.argv[5];

        alternateMergeAndSavePdfs(pdfPath1, pdfPath2, outputPath)
            .then(fileName => {
                console.log(fileName)
            })
            .catch(error => {
                console.log(error)
            });
    }
}


