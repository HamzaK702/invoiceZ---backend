import Invoice from "../../DB/models/invoiceModel.js";
import { generateDocumentPDF } from "../utils/templates.js";
import Quote from "./../../DB/models/quoteModel.js";

const createQuote = async (quoteData) => {
  try {
    quoteData.quoteItems.forEach((item) => {
      item.total = item.unitPrice * item.quantity;
    });

    let total = quoteData.quoteItems.reduce((sum, item) => sum + item.total, 0);
    if (quoteData.discount) total -= quoteData.discount;
    if (quoteData.includeTax && quoteData.taxRate)
      total += (total * quoteData.taxRate) / 100;

    quoteData.total = total;

    const newQuote = new Quote(quoteData);
    await newQuote.save();

    const pdfUrl = await generateDocumentPDF(newQuote, true);
    return { newQuote, pdfUrl };
  } catch (error) {
    throw new Error("Error creating quote: " + error.message);
  }
};

const convertQuoteToInvoice = async (quoteId, userId) => {
  try {
    const quote = await Quote.findOne({ _id: quoteId, userId })
      .populate("clientId")
      .populate("businessId");

    if (!quote) {
      return null;
    }

    const invoiceData = {
      userId,
      clientId: quote.clientId,
      businessId: quote.businessId,
      invoiceDate: new Date().toISOString(),
      dueDate: quote.dueDate,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceItems: quote.quoteItems,
      taxRate: quote.taxRate,
      includeTax: quote.includeTax,
      discount: quote.discount,
      total: quote.total,
    };

    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();

    return newInvoice;
  } catch (error) {
    throw new Error("Error converting quote to invoice: " + error.message);
  }
};

const getQuotesByUser = async (userId) => {
  try {
    const quotes = await Quote.find({ userId });
    return quotes;
  } catch (error) {
    throw new Error("Error fetching quotes: " + error.message);
  }
};

const getQuoteById = async (quoteId, userId) => {
  try {
    const quote = await Quote.findOne({ _id: quoteId, userId });
    return quote;
  } catch (error) {
    throw new Error("Error fetching quote: " + error.message);
  }
};

const patchQuote = async (quoteId, userId, updateData) => {
  try {
    const updatedQuote = await Quote.findOneAndUpdate(
      { _id: quoteId, userId },
      { $set: updateData },
      { new: true }
    );
    return updatedQuote;
  } catch (error) {
    throw new Error("Error updating quote: " + error.message);
  }
};

const deleteQuote = async (quoteId, userId) => {
  try {
    const deletedQuote = await Quote.findOneAndDelete({ _id: quoteId, userId });
    return deletedQuote;
  } catch (error) {
    throw new Error("Error deleting quote: " + error.message);
  }
};

export default {
  createQuote,
  convertQuoteToInvoice,
  getQuotesByUser,
  getQuoteById,
  patchQuote,
  deleteQuote,
};
