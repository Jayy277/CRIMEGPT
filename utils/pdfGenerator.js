const PDFDocument = require('pdfkit');

/**
 * Generates a clean, professional PDF report of crime statistics/list using PDFKit.
 * Pipes the generated PDF directly to the express response.
 */
const generateReportPDF = (res, title, subtitle, data, dateRange) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Pipe to response
  doc.pipe(res);

  // Colors
  const primaryColor = '#1e293b'; // slate-800
  const secondaryColor = '#0f766e'; // teal-700
  const lightBg = '#f8fafc'; // slate-50
  const textColor = '#334155'; // slate-700
  const accentColor = '#e11d48'; // rose-600

  // Title / Header
  doc
    .rect(0, 0, 595.28, 80)
    .fill(primaryColor);

  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('CrimeGPT — Analytics Report', 40, 25);

  doc
    .fillColor('#94a3b8')
    .font('Helvetica')
    .fontSize(10)
    .text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);

  // Subtitle
  doc
    .fillColor(secondaryColor)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(title, 40, 100);

  doc
    .fillColor(textColor)
    .font('Helvetica')
    .fontSize(10)
    .text(subtitle, 40, 120);

  if (dateRange) {
    doc.text(`Report Period: ${dateRange}`, 40, 135);
  }

  // Summary Metrics Section
  doc.rect(40, 160, 515, 60).fill(lightBg);
  
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('SUMMARY STATISTICS', 50, 170);

  const totalCases = data.length;
  const solvedCases = data.filter(c => ['Solved', 'Closed'].includes(c.status)).length;
  const pendingCases = totalCases - solvedCases;

  doc
    .fillColor(textColor)
    .font('Helvetica')
    .fontSize(10)
    .text(`Total Recorded Cases: ${totalCases}`, 50, 190)
    .text(`Solved / Closed Cases: ${solvedCases}`, 220, 190)
    .text(`Pending Investigations: ${pendingCases}`, 390, 190);

  // Table of cases
  let y = 240;

  // Table Header
  doc
    .rect(40, y, 515, 20)
    .fill(secondaryColor);

  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Case ID', 45, y + 5)
    .text('Date/Time', 115, y + 5)
    .text('Category', 190, y + 5)
    .text('Location (Station)', 280, y + 5)
    .text('Priority', 410, y + 5)
    .text('Status', 480, y + 5);

  y += 20;

  // Table Rows
  doc.font('Helvetica').fontSize(8).fillColor(textColor);

  data.forEach((item, index) => {
    // Page overflow safety
    if (y > 750) {
      doc.addPage();
      y = 40;
      // Re-draw table header on new page
      doc.rect(40, y, 515, 20).fill(secondaryColor);
      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Case ID', 45, y + 5)
        .text('Date/Time', 115, y + 5)
        .text('Category', 190, y + 5)
        .text('Location (Station)', 280, y + 5)
        .text('Priority', 410, y + 5)
        .text('Status', 480, y + 5);
      y += 20;
      doc.font('Helvetica').fontSize(8).fillColor(textColor);
    }

    // Zebra striping
    if (index % 2 === 0) {
      doc.rect(40, y, 515, 18).fill('#f1f5f9');
    }

    const dateStr = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
    const categoryName = item.crimeCategory?.name || 'Unassigned';
    const stationName = item.location?.policeStation || 'N/A';
    const priorityColor = ['High', 'Critical'].includes(item.priority) ? accentColor : textColor;

    doc
      .fillColor(textColor)
      .text(item.crimeId || 'N/A', 45, y + 5)
      .text(`${dateStr} ${item.time || ''}`, 115, y + 5)
      .text(categoryName, 190, y + 5)
      .text(stationName, 280, y + 5)
      .fillColor(priorityColor)
      .text(item.priority || 'Medium', 410, y + 5)
      .fillColor(textColor)
      .text(item.status || 'Reported', 480, y + 5);

    y += 18;
  });

  // Footer on all pages
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .rect(40, 800, 515, 1)
      .fill('#cbd5e1');
    doc
      .fillColor('#94a3b8')
      .font('Helvetica')
      .fontSize(8)
      .text('CrimeGPT Management System — Internal Use Only', 40, 805)
      .text(`Page ${i + 1} of ${pages.count}`, 500, 805);
  }

  // End Document
  doc.end();
};

module.exports = { generateReportPDF };
