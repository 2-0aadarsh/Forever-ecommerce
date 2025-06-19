import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },

    address: [{
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String },
    }],

    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel  = mongoose.models.product || mongoose.model("userModel",userSchema);

export default userModel