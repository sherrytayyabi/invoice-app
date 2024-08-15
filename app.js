const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Function to generate HTML from template and data
function generateHTML(data) {
  let template = fs.readFileSync(path.join(__dirname, 'views', 'invoice-template.html'), 'utf8');

  // Replace placeholders with actual data
  template = template.replace('{{number}}', data.number);
  template = template.replace('{{date}}', data.date);
  template = template.replace('{{customerName}}', data.customer.name);
  template = template.replace('{{customerEmail}}', data.customer.email);

  // Generate items list
  let itemsHTML = '';
  data.items.forEach(item => {
    itemsHTML += `<li>${item.name} - ${item.price}</li>`;
  });
  template = template.replace('{{items}}', itemsHTML);

  template = template.replace('{{total}}', data.total);

  return template;
}

// Route to generate invoice PDF
app.get('/generate-invoice', (req, res) => {
  const invoice = {
    number: '12345',
    date: new Date().toLocaleDateString(),
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    items: [
      { name: 'Item 1', price: '$10' },
      { name: 'Item 2', price: '$20' }
    ],
    total: '$30'
  };

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');

  doc.pipe(res);

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.fontSize(12).text(`Invoice #: ${invoice.number}`);
  doc.text(`Date: ${invoice.date}`);
  doc.moveDown();
  doc.text(`Customer Name: ${invoice.customer.name}`);
  doc.text(`Customer Email: ${invoice.customer.email}`);
  doc.moveDown();
  doc.text('Items:');
  invoice.items.forEach(item => {
    doc.text(`- ${item.name} - ${item.price}`);
  });
  doc.moveDown();
  doc.text(`Total: ${invoice.total}`);
  doc.moveDown();
  doc.text('Thank you for your business!', { align: 'center' });

  doc.end();
});

// Route to preview HTML in the browser
app.get('/preview-invoice', (req, res) => {
  const invoice = {
    number: '12345',
    date: new Date().toLocaleDateString(),
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    items: [
      { name: 'Item 1', price: '$10' },
      { name: 'Item 2', price: '$20' }
    ],
    total: '$30'
  };

  const html = generateHTML(invoice);
  res.send(html);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
