import express from "express";
import {
  deliveryBoyLogin,
} from "../controllers/deliveryAuth.controller.js";

const router = express.Router();

router.post("/login", deliveryBoyLogin);

export default router;