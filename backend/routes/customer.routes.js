import express from "express";

import {
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerLocation,
} from "../controllers/customer.controller.js";

import {
  protectCustomer,
} from "../middleware/auth.middleware.js";

const router = express.Router();


// GET PROFILE
router.get(
  "/profile",
  protectCustomer,
  getCustomerProfile
);


// UPDATE PROFILE
router.put(
  "/profile",
  protectCustomer,
  updateCustomerProfile
);


// UPDATE LOCATION
router.put(
  "/location",
  protectCustomer,
  updateCustomerLocation
);


export default router;