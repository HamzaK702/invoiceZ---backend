import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: function () {
        return !this.facebookId && !this.googleId;
      },
      unique: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },
    },
    googleId: {
      type: String,
      sparse: true
    },
    facebookId: {
      type: String,
      sparse: true,
    },
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
    isOTPVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

//Compare Password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model("User", userSchema);

export default User;
