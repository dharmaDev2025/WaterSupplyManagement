import bcrypt from "bcryptjs";

import Customer from "../models/customer.model.js";
import generateToken from "../utils/generate.token.js";
import sendEmail from "../utils/send.email.js";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

//register
export const registerCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      customerType,
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create customer
    const customer = await Customer.create({
      name,
      phone,
      email: email.toLowerCase(),
      password: hashedPassword,
      customerType: customerType || "home",

      authProvider: "local",

      isEmailVerified: false,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",

      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerType: customer.customerType,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//login
export const loginCustomer = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find customer
    const customer = await Customer.findOne({
      email: email.toLowerCase(),
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Google-only customer may not have password
    if (!customer.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google authentication",
      });
    }

    // Compare password
    const isMatched = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Customer account is inactive",
      });
    }

    // Generate JWT
    const token = generateToken(customer._id);

    res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerType: customer.customerType,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
//gogle auth successs

export const googleAuthSuccess = async (
  req,
  res
) => {
  try {

    const customer = req.user;

    const token = generateToken(customer._id);

    // Later this will redirect to your React frontend
    res.redirect(
      `http://localhost:5173/auth-success?token=${token}`
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const customer = await Customer.findOne({
      email: normalizedEmail,
    });

    // Important:
    // Don't reveal whether email exists
    if (!customer) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset code has been sent.",
      });
    }

    // Google-only account
    if (!customer.password) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset code has been sent.",
      });
    }

    // Prevent repeatedly requesting OTP
    const now = Date.now();

    if (
      customer.passwordReset?.lastRequestedAt &&
      now -
        new Date(
          customer.passwordReset.lastRequestedAt
        ).getTime() <
        60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Please wait before requesting another OTP.",
      });
    }

    // Generate secure 6-digit OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash OTP
    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    customer.passwordReset = {
      otpHash,

      expiresAt:
        new Date(
          Date.now() + 10 * 60 * 1000
        ),

      attempts: 0,

      lastRequestedAt: new Date(),
    };

    await customer.save();

    await sendEmail({
      to: customer.email,

      subject: "Password Reset OTP",

      text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,

      html: `
        <h2>Password Reset</h2>

        <p>Your password reset OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP expires in 10 minutes.</p>

        <p>If you did not request this password reset, ignore this email.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset code has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request",
    });
  }
};
export const verifyResetOtp = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const customer =
      await Customer.findOne({
        email: email
          .trim()
          .toLowerCase(),
      });

    if (
      !customer ||
      !customer.passwordReset?.otpHash
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired reset request",
      });
    }

    // Check expiry
    if (
      !customer.passwordReset.expiresAt ||
      customer.passwordReset.expiresAt <
        new Date()
    ) {
      customer.passwordReset.otpHash =
        null;

      customer.passwordReset.expiresAt =
        null;

      customer.passwordReset.attempts =
        0;

      await customer.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Check attempts
    if (
      customer.passwordReset.attempts >= 5
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many invalid attempts. Request a new OTP.",
      });
    }

    const isOtpValid =
      await bcrypt.compare(
        otp.toString(),
        customer.passwordReset.otpHash
      );

    if (!isOtpValid) {
      customer.passwordReset.attempts += 1;

      await customer.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Generate short-lived reset token
    const resetToken = jwt.sign(
      {
        customerId: customer._id,

        purpose: "password-reset",
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "5m",
      }
    );

    // OTP becomes single use
    customer.passwordReset.otpHash =
      null;

    customer.passwordReset.expiresAt =
      null;

    customer.passwordReset.attempts =
      0;

    await customer.save();

    return res.status(200).json({
      success: true,

      message:
        "OTP verified successfully",

      resetToken,
    });
  } catch (error) {
    console.error(
      "Verify OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify OTP",
    });
  }
};
export const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      resetToken,
      newPassword,
    } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired reset token",
      });
    }

    if (
      decoded.purpose !==
      "password-reset"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid reset token",
      });
    }

    const customer =
      await Customer.findById(
        decoded.customerId
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    customer.password =
      hashedPassword;

    customer.passwordReset = {
      otpHash: null,
      expiresAt: null,
      attempts: 0,
      lastRequestedAt: null,
    };

    await customer.save();

    // Send security notification email
    await sendEmail({
      to: customer.email,

      subject:
        "Your password has been changed",

      text:
        "Your password was changed successfully. If you did not make this change, contact support immediately.",

      html: `
        <h2>Password Changed</h2>

        <p>Your password was changed successfully.</p>

        <p>If you did not make this change, please contact support immediately.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login again.",
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    });
  }
};