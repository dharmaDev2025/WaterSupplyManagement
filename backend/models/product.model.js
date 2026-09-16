import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    productType: {
      type: String,
      enum: ["jar", "bottle"],
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      enum: ["ml", "liter"],
      required: true,
    },

    // For jar: new jar + water
    newJarPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    // For jar: customer returns empty jar
    refillPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    // For bottle: normal purchase
    bottlePrice: {
      type: Number,
      min: 0,
      default: null,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;