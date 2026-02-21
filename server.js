const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { alternateMerge, reversePdf, mergePDFs } = require('./donkersPdfTools');

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Ensure output directory exists
if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}

app.post('/api/merge', upload.array('pdfs', 2), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).send('Please upload 2 PDF files.');
        }

        const pdfPath1 = req.files[0].path;
        const pdfPath2 = req.files[1].path;
        const outputPath = path.join('output', `merged_${Date.now()}.pdf`);

        await mergePDFs([pdfPath1, pdfPath2], outputPath);

        res.download(outputPath, (err) => {
            if (err) console.error(err);
            // Cleanup
            fs.unlinkSync(pdfPath1);
            fs.unlinkSync(pdfPath2);
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error merging PDFs');
    }
});

app.post('/api/reverse', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Please upload a PDF file.');
        }

        const pdfPath = req.file.path;
        const outputPath = path.join('output', `reversed_${Date.now()}.pdf`);

        await reversePdf(pdfPath, outputPath);

        res.download(outputPath, (err) => {
            if (err) console.error(err);
            // Cleanup
            fs.unlinkSync(pdfPath);
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reversing PDF');
    }
});

app.post('/api/alt-merge', upload.array('pdfs', 2), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).send('Please upload 2 PDF files.');
        }

        const pdfPath1 = req.files[0].path;
        const pdfPath2 = req.files[1].path;
        const outputPath = path.join('output', `alt_merged_${Date.now()}.pdf`);

        await alternateMerge(pdfPath1, pdfPath2, outputPath);

        res.download(outputPath, (err) => {
            if (err) console.error(err);
            // Cleanup
            fs.unlinkSync(pdfPath1);
            fs.unlinkSync(pdfPath2);
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error alternately merging PDFs');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
