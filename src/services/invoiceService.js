import Invoice from "./../../DB/models/invoiceModel.js";
import Business from "./../../DB/models/businessModel.js";
import axios from "axios";
import dotenv from "dotenv";
import { generateDocumentPDF } from "../utils/templates.js";
dotenv.config();
const GUID = process.env.ABN_LOOKUP_GUID;
const ABN_LOOKUP_API_URL =
  process.env.ABN_LOOKUP_API_URL ||
  "https://abr.business.gov.au/json/AbnDetails.aspx";


const createInvoice = async (invoiceData) => {
  try {
    if (!invoiceData.invoiceItems || !Array.isArray(invoiceData.invoiceItems)) {
      throw new Error("invoiceItems must be provided as an array.");
    }

    invoiceData.invoiceItems.forEach((item) => {
      item.total = item.unitPrice * item.quantity;
    });
    let total = invoiceData.invoiceItems.reduce(
      (sum, item) => sum + item.total,
      0
    );
    if (invoiceData.discount) {
      total -= invoiceData.discount;
    }
    if (invoiceData.includeTax && invoiceData.taxRate) {
      total += (total * invoiceData.taxRate) / 100;
    }

    invoiceData.total = total;
    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();

    await newInvoice.populate('businessId clientId');

    const pdfUrl = await generateDocumentPDF(newInvoice, false);
    
    return { newInvoice, pdfUrl };
  } catch (error) {
    throw new Error("Error creating invoice: " + error.message);
  }
};

const fetchABNDetails = async (abn) => {
  try {
    const response = await axios.get(ABN_LOOKUP_API_URL, {
      params: {
        abn,
        guid: GUID,
        format: "json",
      },
    });

    let data = response.data;

    if (typeof data === "string") {
      const callbackPrefix = "callback(";
      const callbackSuffix = ")";

      if (data.startsWith(callbackPrefix) && data.endsWith(callbackSuffix)) {
        // Extract the JSON string from the callback
        const jsonString = data.slice(
          callbackPrefix.length,
          -callbackSuffix.length
        );
        data = JSON.parse(jsonString);
      } else {
        // If it's a plain string but not JSONP, attempt to parse it
        data = JSON.parse(data);
      }
    }

    if (data.Error) {
      throw new Error(data.Error.Message);
    }

    return data;
  } catch (error) {
    throw new Error("Error fetching ABN details: " + error.message);
  }
};

const getInvoicesByUser = async (userId) => {
  try {
    const invoices = await Invoice.find({ userId })
      .select('_id invoiceNumber status createdAt clientId')
      .populate({
        path: 'clientId',
        select: 'name',
      });      
    
    return invoices.map(invoice => ({
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientId.name,
      status: invoice.status,
      createdAt: invoice.createdAt,
    }));
  } catch (error) {
    throw new Error("Error fetching invoices: " + error.message);
  }
};

const getInvoiceById = async (invoiceId, userId) => {
  try {
    const invoice = await Invoice.findOne({ _id: invoiceId, userId })
      .populate('clientId')
      .populate('businessId');
    return invoice;
  } catch (error) {
    throw new Error("Error fetching invoice: " + error.message);
  }
};

const patchInvoice = async (invoiceId, userId, updateData) => {
  try {
    let invoice = await Invoice.findOne({ _id: invoiceId, userId });
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (updateData.invoiceItems) {
      updateData.invoiceItems.forEach((item) => {
        item.total = item.unitPrice * item.quantity;
      });
      let total = updateData.invoiceItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
      if (updateData.discount) {
        total -= updateData.discount;
      }
      if (updateData.includeTax && updateData.taxRate) {
        total += (total * updateData.taxRate) / 100;
      }
      updateData.total = total;
    }

    invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, userId },
      { $set: updateData },
      { new: true }
    );

    return invoice;
  } catch (error) {
    throw new Error("Error updating invoice: " + error.message);
  }
};

const deleteInvoice = async (invoiceId, userId) => {
  try {
    const deletedInvoice = await Invoice.findOneAndDelete({
      _id: invoiceId,
      userId,
    });
    return deletedInvoice;
  } catch (error) {
    throw new Error("Error deleting invoice: " + error.message);
  }
};

const getInvoicesWithItemsByUser = async (userId) => {
  try {
    // Fetch all invoices created by the user
    const invoices = await Invoice.find({ userId }).populate("userId");

    console.log(invoices);

    // Map invoices to display invoiceId and count of items
    const invoiceItemsList = invoices.map((invoice) => ({
      invoiceId: invoice._id,
      itemCount: invoice.invoiceItems.length,
      items: invoice.invoiceItems,
    }));

    return invoiceItemsList;
  } catch (error) {
    throw new Error("Error fetching invoices with items: " + error.message);
  }
};

export default {
  createInvoice,
  generateDocumentPDF,
  fetchABNDetails,
  getInvoicesByUser,
  getInvoiceById,
  patchInvoice,
  deleteInvoice,
  getInvoicesWithItemsByUser,
};
