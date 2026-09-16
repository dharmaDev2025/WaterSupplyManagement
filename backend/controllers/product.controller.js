import Product from "../models/product.model.js";


// GET ALL ACTIVE PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      products,
    });

  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
};


// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });

  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product",
    });
  }
};