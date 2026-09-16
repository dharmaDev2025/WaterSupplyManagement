import express from "express";
import passport from "passport";

import {
  registerCustomer,
  loginCustomer,
  googleAuthSuccess,forgotPassword,verifyResetOtp,resetPassword
} from "../controllers/auth.controller.js";
import { forgotPasswordLimiter } from "../middleware/rateLimit.middleware.js";


const router = express.Router();



router.post(
  "/register",
  registerCustomer
);


router.post(
  "/login",
  loginCustomer
);




router.get(
  "/google",

  passport.authenticate(
    "google",
    {
      scope: [
        "profile",
        "email",
      ],
      session: false,
    }
  )
);


router.get(
  "/google/callback",

  passport.authenticate(
    "google",
    {
      session: false,

      failureRedirect:
        "http://localhost:5173/",
    }
  ),

  googleAuthSuccess
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPassword
);
router.post(
  "/verify-reset-otp",
  verifyResetOtp
);
router.post(
  "/reset-password",
  resetPassword
);

export default router;