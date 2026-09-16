import express from "express";

import {
  getProducts,
  getProductById,
} from "../controllers/product.controller.js";

import {
  protectCustomer,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all products - protected
router.get(
  "/all",
  protectCustomer,
  getProducts
);

// Get single product - protected
router.get(
  "/:id",
  protectCustomer,
  getProductById
);

export default router;