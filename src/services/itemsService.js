import mongoose from "mongoose";
import Invoice from "../../DB/models/invoiceModel.js";

const createItem = async (invoiceId, userId, itemData) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId });
  if (!invoice) {
    throw new Error("Invoice not found or not authorized.");
  }

  const newItem = {
    _id: new mongoose.Types.ObjectId(),
    itemName: itemData.itemName,
    description: itemData.description,
    quantity: itemData.quantity,
    unitPrice: itemData.unitPrice,
    total: itemData.quantity * itemData.unitPrice,
  };

  invoice.invoiceItems.push(newItem);

  invoice.total += newItem.total;

  if (invoice.includeTax && invoice.taxRate) {
    const taxAmount = (newItem.total * invoice.taxRate) / 100;
    invoice.total += taxAmount;
  }

  await invoice.save();

  return newItem;
};

const getItems = async (invoiceId, userId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId });
  if (!invoice) {
    throw new Error("Invoice not found or not authorized.");
  }

  const itemsWithInvoiceNumber = invoice.invoiceItems.map((item) => ({
    _id: item._id,
    itemName: item.itemName,
    invoiceNumber: invoice.invoiceNumber,
  }));

  return itemsWithInvoiceNumber;
};

const getItemById = async (invoiceId, itemId, userId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId });
  if (!invoice) {
    throw new Error("Invoice not found or not authorized.");
  }

  const item = invoice.invoiceItems.id(itemId);
  if (!item) {
    throw new Error("Item not found.");
  }

  return item;
};

const updateItem = async (invoiceId, itemId, userId, updateData) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId });
  if (!invoice) {
    throw new Error("Invoice not found or not authorized.");
  }

  const item = invoice.invoiceItems.id(itemId);
  if (!item) {
    throw new Error("Item not found.");
  }

  const oldItemTotal = item.total;

  item.itemName = updateData.itemName || item.itemName;
  item.description = updateData.description || item.description;
  item.quantity =
    updateData.quantity !== undefined ? updateData.quantity : item.quantity;
  item.unitPrice =
    updateData.unitPrice !== undefined ? updateData.unitPrice : item.unitPrice;

  item.total = item.quantity * item.unitPrice;

  invoice.total -= oldItemTotal;
  invoice.total += item.total;

  if (invoice.includeTax && invoice.taxRate) {
    const taxAmount = (invoice.total * invoice.taxRate) / 100;
    invoice.total += taxAmount;
  }

  await invoice.save();

  return item;
};

const deleteItem = async (invoiceId, itemId, userId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId });
  if (!invoice) {
    throw new Error("Invoice not found or not authorized.");
  }

  const item = invoice.invoiceItems.id(itemId);
  if (!item) {
    throw new Error("Item not found.");
  }

  const itemTotal = item.total;

  invoice.invoiceItems.pull({ _id: itemId });

  invoice.total -= itemTotal;

  if (invoice.includeTax && invoice.taxRate) {
    const taxAmount = (invoice.total * invoice.taxRate) / 100;
    invoice.total += taxAmount;
  }

  await invoice.save();
};

export default {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
