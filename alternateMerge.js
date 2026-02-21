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


async function alternateMerge(pdfPath1, pdfPath2, outputPath) {

    

    const mergedPdf = await PDFDocument.create();

    const srcData1 = await fs.readFileSync(pdfPath1);
    const srcDoc1 = await PDFDocument.load(srcData1);

    const srcData2 = await fs.readFileSync(pdfPath2);
    const srcDoc2 = await PDFDocument.load(srcData2);



    const srcPages1 = srcDoc1.getPages();
    const srcPages2 = srcDoc2.getPages();

    const copiedPages1 = await mergedPdf.copyPages(srcDoc1, srcDoc1.getPageIndices());
    const copiedPages2 = await mergedPdf.copyPages(srcDoc2, srcDoc1.getPageIndices());

    let srcOffset1=0;
    let srcOffset2=0;

    for(i=0;i<srcPages1.length+srcPages2.length;i++){

        if( i%2 == 0 ){
            mergedPdf.addPage(copiedPages1[srcOffset1]);
            srcOffset1++;

        }else{
            mergedPdf.addPage(copiedPages2[srcOffset2]);
            srcOffset2++;
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



if( process.argv.length < 5 ){
    console.log("Error with input. Input should be src1PDF, src2PDF, outputPDF");
    process.exit(1);
}
// Example usage
const pdfPath1 = process.argv[2];
const pdfPath2 = process.argv[3];
const outputPath = process.argv[4];

alternateMergeAndSavePdfs(pdfPath1, pdfPath2, outputPath)
    .then(fileName => {
        console.log(fileName)
    })
    .catch(error => {
       console.log(error)
    });