const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');


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

// Example usage
const pdfPaths = [
    'page1.pdf',
    'page2.pdf',
    // Add more PDF paths as needed
];
const outputPath = 'new.pdf';

mergeAndSavePDFs(pdfPaths, outputPath)
    .then(mergedFileName => {
        console.log(mergedFileName)
    })
    .catch(error => {
       console.log(error)
    });