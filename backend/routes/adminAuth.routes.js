import express from "express";

import {
  adminLogin,
  verifyLoginOtp,
  resendLoginOtp,
  forgotAdminPassword,
  verifyResetOtp,
  resetAdminPassword,
} from "../controllers/adminAuth.controller.js";

const router = express.Router();

router.post("/login", adminLogin);

router.post("/verify-login-otp", verifyLoginOtp);

router.post("/resend-login-otp", resendLoginOtp);

router.post("/forgot-password", forgotAdminPassword);

router.post("/verify-reset-otp", verifyResetOtp);

router.post("/reset-password", resetAdminPassword);

export default router;