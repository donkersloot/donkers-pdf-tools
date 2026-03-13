const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { alternateMerge, reversePdf, mergePDFs } = require('./donkersPdfTools');

const testDir = path.join(__dirname, 'test_output');

// Helper function to create a dummy PDF with a specific number of pages
async function createDummyPdf(outputPath, numPages) {
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        page.drawText(`Page ${i + 1}`, { x: 50, y: 700, size: 30 });
    }
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
}

// Setup before all tests
beforeAll(async () => {
    // Create test output directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }

    // Generate dummy PDFs for testing
    await createDummyPdf(path.join(testDir, 'dummy1.pdf'), 3);
    await createDummyPdf(path.join(testDir, 'dummy2.pdf'), 2);
    await createDummyPdf(path.join(testDir, 'dummy3.pdf'), 1);
});

// Teardown after all tests
afterAll(() => {
    // Clean up test output directory
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }
});

describe('donkersPdfTools', () => {

    test('alternateMerge should merge two PDFs alternately', async () => {
        const pdf1Path = path.join(testDir, 'dummy1.pdf'); // 3 pages
        const pdf2Path = path.join(testDir, 'dummy2.pdf'); // 2 pages
        const outputPath = path.join(testDir, 'alternate_merged.pdf');

        const resultPath = await alternateMerge(pdf1Path, pdf2Path, outputPath);

        expect(resultPath).toBe(outputPath);
        expect(fs.existsSync(outputPath)).toBe(true);

        const mergedData = fs.readFileSync(outputPath);
        const mergedDoc = await PDFDocument.load(mergedData);
        // Expect 5 total pages
        expect(mergedDoc.getPageCount()).toBe(5);
    });

    test('reversePdf should reverse the pages of a PDF', async () => {
        const inputPath = path.join(testDir, 'dummy1.pdf'); // 3 pages
        const outputPath = path.join(testDir, 'reversed.pdf');

        const resultPath = await reversePdf(inputPath, outputPath);

        expect(resultPath).toBe(outputPath);
        expect(fs.existsSync(outputPath)).toBe(true);

        const reversedData = fs.readFileSync(outputPath);
        const reversedDoc = await PDFDocument.load(reversedData);
        // Page count should remain the same
        expect(reversedDoc.getPageCount()).toBe(3);
    });

    test('mergePDFs should merge multiple PDFs sequentially', async () => {
        const pdf1Path = path.join(testDir, 'dummy1.pdf'); // 3 pages
        const pdf2Path = path.join(testDir, 'dummy2.pdf'); // 2 pages
        const pdf3Path = path.join(testDir, 'dummy3.pdf'); // 1 page
        const outputPath = path.join(testDir, 'sequential_merged.pdf');

        const resultPath = await mergePDFs([pdf1Path, pdf2Path, pdf3Path], outputPath);

        expect(resultPath).toBe(outputPath);
        expect(fs.existsSync(outputPath)).toBe(true);

        const mergedData = fs.readFileSync(outputPath);
        const mergedDoc = await PDFDocument.load(mergedData);
        // Expect 6 total pages
        expect(mergedDoc.getPageCount()).toBe(6);
    });
});
