const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');


// * const pdfDoc = await PDFDocument.create()
//    * const srcDoc = await PDFDocument.load(...)
//    *
//    * const copiedPages = await pdfDoc.copyPages(srcDoc, [0, 3, 89])
//    * const [firstPage, fourthPage, ninetiethPage] = copiedPages;
//    *
//    * pdfDoc.addPage(fourthPage)
//    * pdfDoc.insertPage(0, ninetiethPage)
//    * pdfDoc.addPage(firstPage)


async function reversePdf(pdfPath, outputPath) {

    

    const reversedPdf = await PDFDocument.create();
    const srcData = await fs.readFileSync(pdfPath);

    const srcDoc = await PDFDocument.load(srcData);

    const srcPages = srcDoc.getPages();

    const pageNumbers = Array(srcPages.length);

    console.log("File to revers" + pageNumbers);

    for(j=0;j<srcPages.length;j++){
        pageNumbers[j] = pageNumbers.length-j-1;   
    }


    const copiedPages = await reversedPdf.copyPages(srcDoc,pageNumbers);
    
    for(  i=0; i<copiedPages.length;i++){
        reversedPdf.addPage(copiedPages[i]);

    }

    const reversedPdfBytes = await reversedPdf.save();
    fs.writeFileSync(outputPath, reversedPdfBytes);

    return outputPath;
}

async function refersePdf(pdfPaths, outputPath) {
    try {
        const fileName = await reversePdf(pdfPath, outputPath);
        console.log('PDFs reversed successfully. Reversed file saved at:', fileName);
        return fileName;
    } catch (error) {
        console.error('Error reversing PDFs:', error);
        throw error;
    }
}

// Example usage
const pdfPath = '2.PDF';
const outputPath = 'new.pdf';

refersePdf(pdfPath, outputPath)
    .then(reversedFileName => {
        console.log(reversedFileName)
    })
    .catch(error => {
       console.log(error)
    });