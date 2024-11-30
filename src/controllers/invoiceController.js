import Business from "../../DB/models/businessModel.js";
import Client from "../../DB/models/clientModel.js";
import Invoice from "../../DB/models/invoiceModel.js";
import InvoiceService from "../services/InvoiceService.js";

const createInvoiceController = async (req, res) => {
  const {
    clientName,
    clientAddress,
    clientEmail,
    clientPhoneNumber,
    businessName,
    businessAddress,
    businessEmail,
    businessPhoneNumber,
    abn,
    invoiceDate,
    dueDate,
    invoiceNumber,
    invoiceItems,
    taxRate,
    includeTax,
    discount,
    templateType,
    status,
  } = req.body;

  try {
    const userId = req.user._id;

    const allowedTemplates = ["template1", "template2", "template3"];
    if (!allowedTemplates.includes(templateType)) {
      return res.status(400).json({ message: "Invalid template type selected." });
    }

    let clientData = await Client.findOne({ name: clientName, userId });
    if (!clientData) {
      clientData = new Client({
        name: clientName,
        address: clientAddress,
        email: clientEmail,
        phoneNumber: clientPhoneNumber,
        userId: userId,
      });
      await clientData.save();
    }

    let businessData = await Business.findOne({ name: businessName, userId });
    if (!businessData) {
      businessData = new Business({
        name: businessName,
        address: businessAddress,
        email: businessEmail,
        phoneNumber: businessPhoneNumber,
        abn,
        userId: userId,
      });
      await businessData.save();
    }

    const invoiceData = {
      clientId: clientData._id,
      businessId: businessData._id,
      userId,
      invoiceDate,
      dueDate,
      invoiceNumber,
      invoiceItems,
      taxRate,
      includeTax,
      discount,
      templateType,
      status,
    };

    const { newInvoice, pdfUrl } = await InvoiceService.createInvoice(invoiceData);

    await newInvoice.populate('businessId clientId');

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: newInvoice,
      pdfUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateInvoicePDFController = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user._id;

    const invoice = await Invoice.findOne({ _id: invoiceId, userId }).populate('businessId clientId');
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    const pdfUrl = await generateDocumentPDF(invoice, false)

    res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      pdfUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchABNDetailsController = async (req, res) => {
  const { abn } = req.query;

  if (!abn) {
    return res.status(400).json({ message: "ABN is optional." });
  }

  try {
    const abnDetails = await InvoiceService.fetchABNDetails(abn);
    res.status(200).json({ success: true, abnDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInvoicesByUserController = async (req, res) => {
  try {
    const userId = req.user._id;
    const invoices = await InvoiceService.getInvoicesByUser(userId);
    if (!invoices.length) {
      return res
        .status(404)
        .json({ message: "No invoices found for this user." });
    }
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoiceByIdController = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user._id;
    const invoice = await InvoiceService.getInvoiceById(invoiceId, userId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const patchInvoiceController = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const invoice = await Invoice.findOne({ _id: invoiceId, userId });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found or not authorized." });
    }

    if (updateData.clientName || updateData.clientAddress || updateData.clientEmail || updateData.clientPhoneNumber) {
      await Client.findByIdAndUpdate(
        invoice.clientId, 
        {
          ...(updateData.clientName && { name: updateData.clientName }),
          ...(updateData.clientAddress && { address: updateData.clientAddress }),
          ...(updateData.clientEmail && { email: updateData.clientEmail }),
          ...(updateData.clientPhoneNumber && { phoneNumber: updateData.clientPhoneNumber }),
        },
        { new: true }
      );
      delete updateData.clientName;
      delete updateData.clientAddress;
      delete updateData.clientEmail;
      delete updateData.clientPhoneNumber;
    }

    if (updateData.businessName || updateData.businessAddress || updateData.businessEmail || updateData.businessPhoneNumber || updateData.abn) {
      await Business.findByIdAndUpdate(
        invoice.businessId, 
        {
          ...(updateData.businessName && { name: updateData.businessName }),
          ...(updateData.businessAddress && { address: updateData.businessAddress }),
          ...(updateData.businessEmail && { email: updateData.businessEmail }),
          ...(updateData.businessPhoneNumber && { phoneNumber: updateData.businessPhoneNumber }),
          ...(updateData.abn && { abn: updateData.abn }),
        },
        { new: true }
      );
      delete updateData.businessName;
      delete updateData.businessAddress;
      delete updateData.businessEmail;
      delete updateData.businessPhoneNumber;
      delete updateData.abn;
    }

    const updatedInvoice = await InvoiceService.patchInvoice(
      invoiceId,
      userId,
      updateData
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found or not authorized." });
    }

    await updatedInvoice.populate('businessId clientId')


    res.status(200).json({
      success: true,
      message: "Invoice updated successfully.",
      invoice: updatedInvoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInvoiceController = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user._id;
    const deletedInvoice = await InvoiceService.deleteInvoice(
      invoiceId,
      userId
    );

    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found or not authorized." });
    }

    res
      .status(200)
      .json({ success: true, message: "Invoice deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllItemsByUserController = async (req, res) => {
  try {
    const itemsGroupedByUser = await InvoiceService.getInvoicesWithItemsByUser();
    res.status(200).json({ success: true, data: itemsGroupedByUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createInvoiceController,
  fetchABNDetailsController,
  getInvoicesByUserController,
  getInvoiceByIdController,
  patchInvoiceController,
  deleteInvoiceController,
  getAllItemsByUserController,
  generateInvoicePDFController
};
