import express from "express";

import {
  getAllOrders,
  getOrderById,
  assignDeliveryBoy,
  updateOrderStatus,
} from "../controllers/adminOrder.controller.js";

import {
  protectAdmin,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

router.get(
  "/",
  protectAdmin,
  getAllOrders
);

router.get(
  "/:id",
  protectAdmin,
  getOrderById
);

router.patch(
  "/:id/assign-delivery",
  protectAdmin,
  assignDeliveryBoy
);

router.patch(
  "/:id/status",
  protectAdmin,
  updateOrderStatus
);

export default router;