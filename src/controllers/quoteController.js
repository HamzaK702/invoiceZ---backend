import Business from "../../DB/models/businessModel.js";
import Client from "../../DB/models/clientModel.js";
import quoteService from "../services/quoteService.js";

const createQuoteController = async (req, res) => {
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
    quoteDate,
    dueDate,
    quoteNumber,
    quoteItems,
    taxRate,
    includeTax,
    discount,
    templateType,
    status,
  } = req.body;

  try {
    const userId = req.user._id;

    let clientData = await Client.findOne({ name: clientName, userId });
    if (!clientData) {
      clientData = new Client({
        name: clientName,
        address: clientAddress,
        email: clientEmail,
        phoneNumber: clientPhoneNumber,
        userId,
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
        userId,
      });
      await businessData.save();
    }

    const quoteData = {
      clientId: clientData._id,
      businessId: businessData._id,
      userId,
      quoteDate,
      dueDate,
      quoteNumber,
      quoteItems,
      taxRate,
      includeTax,
      discount,
      templateType,
      status,
    };

    const { newQuote, pdfUrl } = await quoteService.createQuote(quoteData);

    res.status(201).json({
      success: true,
      message: "Quote created successfully",
      quote: newQuote,
      pdfUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const convertQuoteToInvoiceController = async (req, res) => {
  const { quoteId } = req.params;
  const userId = req.user._id;

  try {
    const newInvoice = await quoteService.convertQuoteToInvoice(
      quoteId,
      userId
    );

    if (!newInvoice) {
      return res.status(404).json({ message: "Quote not found." });
    }

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuotesByUserController = async (req, res) => {
  try {
    const userId = req.user._id;

    const quotes = await quoteService.getQuotesByUser(userId);

    if (!quotes.length) {
      return res
        .status(404)
        .json({ message: "No quotes found for this user." });
    }

    res.status(200).json({ success: true, quotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuoteByIdController = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user._id;

    const quote = await quoteService.getQuoteById(quoteId, userId);

    if (!quote) {
      return res.status(404).json({ message: "Quote not found." });
    }

    res.status(200).json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const patchQuoteController = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user._id;

    const updatedQuote = await quoteService.patchQuote(
      quoteId,
      userId,
      req.body
    );

    if (!updatedQuote) {
      return res
        .status(404)
        .json({ message: "Quote not found or not authorized." });
    }

    res.status(200).json({
      success: true,
      message: "Quote updated successfully.",
      updatedQuote,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuoteController = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user._id;

    const deletedQuote = await quoteService.deleteQuote(quoteId, userId);

    if (!deletedQuote) {
      return res
        .status(404)
        .json({ message: "Quote not found or not authorized." });
    }

    res
      .status(200)
      .json({ success: true, message: "Quote deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createQuoteController,
  convertQuoteToInvoiceController,
  getQuotesByUserController,
  getQuoteByIdController,
  patchQuoteController,
  deleteQuoteController,
};
