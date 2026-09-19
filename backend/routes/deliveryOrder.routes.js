import express from "express";

import {
  getActiveOrders,
  getDeliveredOrders,
  getOrderById,
  sendDeliveryOtp,
  verifyDeliveryOtp,
} from "../controllers/deliveryOrder.controller.js";

import {
  protectDeliveryBoy,
} from "../middleware/deliveryAuth.middleware.js";

const router = express.Router();

router.get(
  "/active",
  protectDeliveryBoy,
  getActiveOrders
);

router.get(
  "/delivered",
  protectDeliveryBoy,
  getDeliveredOrders
);

router.post(
  "/:id/send-delivery-otp",
  protectDeliveryBoy,
  sendDeliveryOtp
);

router.post(
  "/:id/verify-delivery-otp",
  protectDeliveryBoy,
  verifyDeliveryOtp
);

router.get(
  "/:id",
  protectDeliveryBoy,
  getOrderById
);

export default router;