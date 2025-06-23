import mongoose from "mongoose";

// Utility function to title case strings
const toTitleCase = (str) => {
  return str
    ?.toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
};

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, "street address is required"],
    set: (v) => toTitleCase(v?.trim()),
  },
  city: {
    type: String,
    required: [true, "city address is required"],
    set: (v) => toTitleCase(v?.trim()),
  },
  state: {
    type: String,
    required: [true, "state address is required"],
    set: (v) => toTitleCase(v?.trim()),
  },
  zip: {
    type: String,
    required: [true, "zip address is required"],
    set: (v) => v?.trim(),
  },
  country: {
    type: String,
    required: [true, "country address is required"],
    set: (v) => toTitleCase(v?.trim()),
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      set: (v) => toTitleCase(v?.trim()),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      unique : true,
      // Don't apply transformation here; it should be hashed before save
    },
    phone: {
      type: String,
      required: true,
      unique : true,
      set: (v) => v?.trim(),
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    address: [addressSchema], // embedded and normalized

    cartData: {
      type: Object,
      default: {},
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

// Model
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
