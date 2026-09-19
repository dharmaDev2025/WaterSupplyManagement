import express from "express";

import {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
} from "../controllers/adminCustomer.controller.js";

import {
  protectAdmin,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

router.get("/", protectAdmin, getAllCustomers);

router.get("/:id", protectAdmin, getCustomerById);

router.patch(
  "/:id/status",
  protectAdmin,
  updateCustomerStatus
);

export default router;