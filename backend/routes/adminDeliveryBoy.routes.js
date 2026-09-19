import express from "express";

import {
  addDeliveryBoy,
  getAllDeliveryBoys,
  getDeliveryBoyById,
  updateDeliveryBoy,
  updateDeliveryBoyPassword,
  updateDeliveryBoyStatus,
} from "../controllers/adminDeliveryBoy.controller.js";

import {
  protectAdmin,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

router.post("/", protectAdmin, addDeliveryBoy);

router.get("/", protectAdmin, getAllDeliveryBoys);

router.get("/:id", protectAdmin, getDeliveryBoyById);

router.put("/:id", protectAdmin, updateDeliveryBoy);

router.patch(
  "/:id/password",
  protectAdmin,
  updateDeliveryBoyPassword
);

router.patch(
  "/:id/status",
  protectAdmin,
  updateDeliveryBoyStatus
);

export default router;