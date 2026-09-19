import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      productType,
      size,
      unit,
      newJarPrice,
      refillPrice,
      bottlePrice,
      stock,
    } = req.body;

    if (!name || !productType || !size || !unit) {
      return res.status(400).json({
        success: false,
        message: "Name, product type, size and unit are required",
      });
    }

    if (!["jar", "bottle"].includes(productType)) {
      return res.status(400).json({
        success: false,
        message: "Product type must be jar or bottle",
      });
    }

    if (!["ml", "liter"].includes(unit)) {
      return res.status(400).json({
        success: false,
        message: "Unit must be ml or liter",
      });
    }

    if (productType === "jar") {
      if (
        newJarPrice === undefined ||
        newJarPrice === null ||
        refillPrice === undefined ||
        refillPrice === null
      ) {
        return res.status(400).json({
          success: false,
          message: "New jar price and refill price are required for jar",
        });
      }
    }

    if (productType === "bottle") {
      if (bottlePrice === undefined || bottlePrice === null) {
        return res.status(400).json({
          success: false,
          message: "Bottle price is required for bottle",
        });
      }
    }

    const product = await Product.create({
      name,
      productType,
      size,
      unit,
      newJarPrice:
        productType === "jar" ? newJarPrice : null,
      refillPrice:
        productType === "jar" ? refillPrice : null,
      bottlePrice:
        productType === "bottle" ? bottlePrice : null,
      stock: stock ?? 0,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.log("Add product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add product",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.log("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      productType,
      size,
      unit,
      newJarPrice,
      refillPrice,
      bottlePrice,
      stock,
      isActive,
    } = req.body;

    if (
      productType !== undefined &&
      !["jar", "bottle"].includes(productType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Product type must be jar or bottle",
      });
    }

    if (
      unit !== undefined &&
      !["ml", "liter"].includes(unit)
    ) {
      return res.status(400).json({
        success: false,
        message: "Unit must be ml or liter",
      });
    }

    if (name !== undefined) {
      product.name = name;
    }

    if (size !== undefined) {
      product.size = size;
    }

    if (unit !== undefined) {
      product.unit = unit;
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (isActive !== undefined) {
      product.isActive = isActive;
    }

    if (productType !== undefined) {
      product.productType = productType;
    }

    if (product.productType === "jar") {
      if (newJarPrice !== undefined) {
        product.newJarPrice = newJarPrice;
      }

      if (refillPrice !== undefined) {
        product.refillPrice = refillPrice;
      }

      product.bottlePrice = null;
    }

    if (product.productType === "bottle") {
      if (bottlePrice !== undefined) {
        product.bottlePrice = bottlePrice;
      }

      product.newJarPrice = null;
      product.refillPrice = null;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product",
    });
  }
};

export const deactivateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      product,
    });
  } catch (error) {
    console.log("Deactivate product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to deactivate product",
    });
  }
};