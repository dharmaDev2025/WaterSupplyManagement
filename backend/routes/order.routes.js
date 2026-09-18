import express from "express";

import {
  createStripeSession,
  verifyStripePayment,
  getMyOrders,
  getOrderById,
  getOrderStatus,
  reorder,
} from "../controllers/order.controller.js";

import {
  protectCustomer,
} from "../middleware/auth.middleware.js";

const router = express.Router();


// Start payment
router.post(
  "/create-payment",
  protectCustomer,
  createStripeSession
);


// Verify payment + save order
router.post(
  "/verify-payment",
  protectCustomer,
  verifyStripePayment
);


// Get customer's orders
router.get(
  "/my-orders",
  protectCustomer,
  getMyOrders
);


// Get order status
router.get(
  "/:id/status",
  protectCustomer,
  getOrderStatus
);


// Reorder previous order
router.post(
  "/:id/reorder",
  protectCustomer,
  reorder
);


// Get single order
router.get(
  "/:id",
  protectCustomer,
  getOrderById
);


export default router;