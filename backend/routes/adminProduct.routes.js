import express from "express";

import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
} from "../controllers/adminProduct.controller.js";

import { protectAdmin } from "../middleware/adminAuth.middleware.js";

const router = express.Router();

router.post("/", protectAdmin, addProduct);

router.get("/", protectAdmin, getAllProducts);

router.get("/:id", protectAdmin, getProductById);

router.put("/:id", protectAdmin, updateProduct);

router.delete("/:id", protectAdmin, deactivateProduct);

export default router;