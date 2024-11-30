import { model } from "mongoose";
import { Schema } from "mongoose";

const invoiceSchema = new Schema({
  userId:{
    type:Schema.Types.ObjectId,
    ref: 'User',
    required:true
  },
  clientId:{
    type:Schema.Types.ObjectId,
    ref:'Client',
    required:true
  },
  businessId:{
    type:Schema.Types.ObjectId,
    ref:'Business',
    required:true
  },
  invoiceDate: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  invoiceItems: [
    {
      itemName: { type: String, required: true },
      description: { type: String },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      total: { type: Number, default: 0 },
    },
  ],
  taxRate: {
    type: Number,
  },
  includeTax: {
    type: Boolean,
    default: false,
  },
  discount:{
    type:Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
  },
  templateType: {
    type: String,
    enum: ['template1', 'template2', 'template3'],
    default: 'template1',
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Overdue'],
    default: 'Unpaid',
    required: true
  }
},{
  timestamps:true
});

const Invoice = model("Invoice", invoiceSchema);

export default Invoice;
