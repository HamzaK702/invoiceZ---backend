import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import Business from "../../DB/models/businessModel.js";
import Client from "../../DB/models/clientModel.js";
import { uploadFileToCloudinary } from "../fileUpload/cloudinary.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateDocumentPDF = async (document, isQuote = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      const templateType = document.templateType || "template1";
      let pdfBuffer;

      switch (templateType) {
        case "template1":
          pdfBuffer = await generateTemplate1(document, isQuote);
          break;
        case "template2":
          pdfBuffer = await generateTemplate2(document, isQuote);
          break;
        case "template3":
          pdfBuffer = await generateTemplate3(document, isQuote);
          break;
        default:
          pdfBuffer = await generateTemplate1(document, isQuote); 
      }

      const folderName = isQuote ? "quotes" : "invoices";
      const pdfUrl = await uploadFileToCloudinary(pdfBuffer, folderName);
      resolve(pdfUrl);
    } catch (error) {
      reject(new Error(`Error generating ${isQuote ? "quote" : "invoice"} PDF: ` + error.message));
    }
  });
};

const generateTemplate1 = async (document, isQuote) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  try {
    const business = await Business.findById(document.businessId);
    const client = await Client.findById(document.clientId);

    if (!business || !client) {
      throw new Error("Business or Client not found for the given document.");
    }

    // Header with Title
    doc.fontSize(20).text(isQuote ? "Quote" : "Tax Invoice", { align: "center" });
    doc.fontSize(10).text(`Number: ${document.quoteNumber || document.invoiceNumber}`, { align: "right" });
    doc.text(`Date: ${document.quoteDate || document.invoiceDate}`, { align: "right" });
    doc.text(`Due Date: ${document.dueDate}`, { align: "right" });
    doc.text(`Status: ${document.status}`, { align: "right" });

    doc.moveDown(2);

    // Business Information Section
    doc.fontSize(12).text("Business Information:", { underline: true });
    doc.text(`Business Name: ${business.name}`);
    doc.text(`ABN: ${business.abn || "N/A"}`);
    doc.text(`Business Address: ${business.address}`);
    if (business.email) doc.text(`Business Email: ${business.email}`);
    if (business.phoneNumber) doc.text(`Business Phone Number: ${business.phoneNumber}`);

    doc.moveDown(2);

    // Client Information Section
    doc.fontSize(12).text("Bill To:", { underline: true });
    doc.text(`Client Name: ${client.name}`);
    doc.text(`Client Address: ${client.address}`);
    if (client.email) doc.text(`Client Email: ${client.email}`);
    if (client.phoneNumber) doc.text(`Client Phone Number: ${client.phoneNumber}`);

    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    const tableLeft = 50;
    const tableWidth = 500;

    // Draw table header background and borders
    doc.rect(tableLeft, tableTop, tableWidth, 20).fill("#D3D3D3");
    doc.fillColor("#000000");

    doc.fontSize(10).text("Item", tableLeft + 5, tableTop + 5); // Add Item column
    doc.text("Description", tableLeft + 100, tableTop + 5); // Shift description to make space for item
    doc.text("Qty", tableLeft + 250, tableTop + 5);
    doc.text("Unit Price", tableLeft + 300, tableTop + 5, { width: 90, align: "right" });
    doc.text("Total", tableLeft + 400, tableTop + 5, { width: 90, align: "right" });

    doc.moveDown();

    // Table Rows - Draw borders and add items
    const items = isQuote ? document.quoteItems : document.invoiceItems;
    if (!items) {
      throw new Error("Items list not found in document.");
    }

    let yPos = tableTop + 20;
    items.forEach((item, i) => {
      const rowHeight = 20;
      const backgroundColor = i % 2 === 0 ? "#FFFFFF" : "#F0F0F0";

      doc.rect(tableLeft, yPos, tableWidth, rowHeight).fill(backgroundColor);
      doc.fillColor("#000000");

      doc.text(item.itemName, tableLeft + 5, yPos + 5); // Item column
      doc.text(item.description || "", tableLeft + 100, yPos + 5); // Description
      doc.text(item.quantity, tableLeft + 250, yPos + 5); // Quantity
      doc.text(`$${item.unitPrice.toFixed(2)}`, tableLeft + 300, yPos + 5, { width: 90, align: "right" }); // Unit Price
      doc.text(`$${item.total.toFixed(2)}`, tableLeft + 400, yPos + 5, { width: 90, align: "right" }); // Total

      yPos += rowHeight;
    });

    doc.moveDown(2);

    // Total Calculation (subtotal, tax, and total)
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = ((subtotal - document.discount) * document.taxRate) / 100;
    const total = subtotal - document.discount + tax;

    // Aligning the total amounts to the right
    const totalX = 400; // X position for total amount display
    const totalY = doc.y + 20; // Y position for subtotal
    const lineHeight = 15;

    doc.fontSize(10).text(`Subtotal: $${subtotal.toFixed(2)}`, totalX, totalY, { align: "right" });
    doc.text(`Discount: $${document.discount.toFixed(2)}`, totalX, totalY + lineHeight, { align: "right" });
    doc.text(`Tax (${document.taxRate}%): $${tax.toFixed(2)}`, totalX, totalY + 2 * lineHeight, { align: "right" });
    doc.fontSize(14).text(`Total Amount: $${total.toFixed(2)}`, totalX, totalY + 3 * lineHeight, { align: "right", bold: true });

    // Footer (optional payment details)
    doc.moveDown(5);
    doc.fontSize(10).text("[Payment details or terms can be added here]", { align: "center" });

    doc.end();
    return Buffer.concat(buffers); 
  } catch (error) {
    throw new Error(`Error generating Template 1 ${isQuote ? "quote" : "invoice"} PDF: ` + error.message);
  }
};

// Template 2
const generateTemplate2 = async (document, isQuote) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  try {
    const business = await Business.findById(document.businessId);
    const client = await Client.findById(document.clientId);

    if (!business || !client) {
      throw new Error("Business or Client not found for the given document.");
    }

    // Header with Title and Number
    doc
      .fillColor("#336699")
      .fontSize(24)
      .text(isQuote ? "QUOTE" : "INVOICE", 110, 57);
    doc
      .fillColor("#444444")
      .fontSize(10)
      .text(
        `Number: ${document.quoteNumber || document.invoiceNumber}`,
        200,
        50,
        { align: "right" }
      );
    doc.text(`Date: ${document.quoteDate || document.invoiceDate}`, 200, 65, {
      align: "right",
    });
    doc.text(`Due Date: ${document.dueDate}`, 200, 80, { align: "right" });
    doc.text(`Status: ${document.status}`, { align: "right" });

    doc.moveDown();

    // Business Information
    doc.fillColor("#336699").fontSize(12).text("From:", 50, 130);
    doc.font("Helvetica-Bold").text(business.name, 50, 145);
    doc
      .font("Helvetica")
      .fillColor("#000000")
      .text(business.address)
      .text(business.email)
      .text(business.phoneNumber);

    // Client Information
    doc.fillColor("#336699").text("To:", 300, 130);
    doc.font("Helvetica-Bold").text(client.name, 300, 145);
    doc
      .font("Helvetica")
      .fillColor("#000000")
      .text(client.address)
      .text(client.email)
      .text(client.phoneNumber);

    doc.moveDown(2);

    // Document Items Table with custom styling
    const items = isQuote ? document.quoteItems : document.invoiceItems;
    generateTable(doc, items);

    // Total Calculation with custom styling
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = ((subtotal - document.discount) * document.taxRate) / 100;
    const total = subtotal - document.discount + tax;

    doc
      .fontSize(12)
      .fillColor("#000000")
      .text(`Subtotal: $${subtotal.toFixed(2)}`, { align: "right" })
      .text(`Discount: $${document.discount.toFixed(2)}`, { align: "right" })
      .text(`Tax (${document.taxRate}%): $${tax.toFixed(2)}`, {
        align: "right",
      })
      .fontSize(14)
      .fillColor("#336699")
      .text(`Total Amount: $${total.toFixed(2)}`, {
        align: "right",
        bold: true,
      });

    // Footer
    doc
      .fontSize(10)
      .fillColor("#555555")
      .text("Thank you for your business!", 50, 750, {
        align: "center",
        width: 500,
      });

    doc.end();
    return Buffer.concat(buffers); 
  } catch (error) {
    throw new Error(
      `Error generating Template 2 ${isQuote ? "quote" : "invoice"} PDF: ` +
        error.message
    );
  }
};

const generateTable = (doc, items) => {
  const tableTop = doc.y;
  const itemX = 50;
  const descriptionX = 150;
  const quantityX = 280;
  const unitPriceX = 330;
  const lineTotalX = 400;

  // Table Header with background
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#D3D3D3");
  doc
    .rect(itemX, tableTop - 5, 500, 20)
    .fill("#D3D3D3")
    .fillColor("#000000");
  doc.text("Item", itemX, tableTop);
  doc.text("Description", descriptionX, tableTop);
  doc.text("Qty", quantityX, tableTop);
  doc.text("Unit Price", unitPriceX, tableTop);
  doc.text("Total", lineTotalX, tableTop);
  doc.moveDown();

  // Table Rows
  doc.font("Helvetica").fillColor("#000000");
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const y = tableTop + 25 + i * 25;

    doc.text(item.itemName, itemX, y);
    doc.text(item.description || "", descriptionX, y);
    doc.text(item.quantity, quantityX, y);
    doc.text(`$${item.unitPrice.toFixed(2)}`, unitPriceX, y);
    doc.text(`$${item.total.toFixed(2)}`, lineTotalX, y);
  }
};

// Template 3
const generateTemplate3 = async (document, isQuote) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  try {
    const business = await Business.findById(document.businessId);
    const client = await Client.findById(document.clientId);

    if (!business || !client) {
      throw new Error("Business or Client not found for the given document.");
    }

    // Add a background color for the whole document
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8f8f8");
    doc.fillColor("#000000");

    // Header with Title and Number
    doc
      .fontSize(24)
      .fillColor("#444444")
      .text(isQuote ? "Quote" : "Invoice", { align: "center" });
    doc
      .fontSize(12)
      .text(`Number: ${document.quoteNumber || document.invoiceNumber}`, {
        align: "center",
      });
    doc.text(`Date: ${document.quoteDate || document.invoiceDate}`, {
      align: "center",
    });
    doc.text(`Due Date: ${document.dueDate}`, { align: "center" });
    doc.text(`Status: ${document.status}`, { align: "center" });

    doc.moveDown(2);

    // Business and Client Information in columns
    doc.fontSize(10).fillColor("#444444");
    const startY = doc.y;

    // Business Info
    doc.text("From:", 50, startY);
    doc.text(business.name);
    doc.text(business.address);
    if (business.email) doc.text(business.email);
    if (business.phoneNumber) doc.text(business.phoneNumber);

    // Client Info
    doc.text("To:", 350, startY);
    doc.text(client.name);
    doc.text(client.address);
    if (client.email) doc.text(client.email);
    if (client.phoneNumber) doc.text(client.phoneNumber);

    doc.moveDown(2);

    // Document Items Table with custom layout
    const items = isQuote ? document.quoteItems : document.invoiceItems;
    generateTableTemplate3(doc, items);

    // Total Calculation with custom layout
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = ((subtotal - document.discount) * document.taxRate) / 100;
    const total = subtotal - document.discount + tax;

    doc.moveDown(2);

    doc
      .fontSize(12)
      .text(`Subtotal: $${subtotal.toFixed(2)}`, { align: "right" });
    doc.text(`Discount: $${document.discount.toFixed(2)}`, { align: "right" });
    doc.text(`Tax (${document.taxRate}%): $${tax.toFixed(2)}`, {
      align: "right",
    });
    doc
      .fontSize(14)
      .fillColor("#336699")
      .text(`Total Amount: $${total.toFixed(2)}`, {
        align: "right",
        bold: true,
      });

    // Footer
    doc.moveDown(5);
    doc
      .fontSize(10)
      .fillColor("#555555")
      .text("Please make payment within 15 days.", 50, 750, {
        align: "center",
        width: 500,
      });

    doc.end();
    return Buffer.concat(buffers); 
  } catch (error) {
    throw new Error(
      `Error generating Template 3 ${isQuote ? "quote" : "invoice"} PDF: ` +
        error.message
    );
  }
};

//Template 3
const generateTableTemplate3 = (doc, items) => {
  const tableTop = doc.y;
  const itemX = 50;
  const descriptionX = 150;
  const quantityX = 280;
  const unitPriceX = 330;
  const lineTotalX = 400;

  // Table Header with background
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#D3D3D3");
  doc
    .rect(itemX, tableTop - 5, 500, 20)
    .fill("#D3D3D3")
    .fillColor("#000000");
  doc.text("Item", itemX, tableTop);
  doc.text("Description", descriptionX, tableTop);
  doc.text("Qty", quantityX, tableTop);
  doc.text("Unit Price", unitPriceX, tableTop);
  doc.text("Total", lineTotalX, tableTop);
  doc.moveDown();

  // Table Rows with alternating background colors
  doc.font("Helvetica").fillColor("#000000");
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const y = tableTop + 25 + i * 25;
    const backgroundColor = i % 2 === 0 ? "#FFFFFF" : "#F8F8F8";

    // Draw background color for each row
    doc.rect(itemX, y - 5, 500, 20).fill(backgroundColor);
    doc.fillColor("#000000");

    // Add item data
    doc.text(item.itemName, itemX, y);
    doc.text(item.description || "", descriptionX, y);
    doc.text(item.quantity, quantityX, y);
    doc.text(`$${item.unitPrice.toFixed(2)}`, unitPriceX, y);
    doc.text(`$${item.total.toFixed(2)}`, lineTotalX, y);
  }
};