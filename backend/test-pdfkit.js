const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
const filePath = './test-output.pdf';
const stream = fs.createWriteStream(filePath);
doc.pipe(stream);

doc.fontSize(25).text('PDFKit Test', { align: 'center' });
doc.moveDown();
doc.fontSize(16).text('If you can open this file, PDFKit is working!');
doc.end();

stream.on('finish', () => {
  console.log('PDF generated at', filePath);
}); 