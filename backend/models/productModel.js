import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: [String], required: true }, // image1, image2, etc.
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: [String], required: true },
    bestseller: { type: Boolean, default: false },
  }, { timestamps: true });

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel