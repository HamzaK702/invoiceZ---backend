import { model, Schema } from "mongoose";

const clientSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

clientSchema.pre('validate', function(next) {
  if (!this.email && !this.phoneNumber) {
    this.invalidate('email', 'At least one of email or phone number is required.');
    this.invalidate('phoneNumber', 'At least one of email or phone number is required.');
  }
  next();
});

const Client = model("Client", clientSchema);
export default Client;
