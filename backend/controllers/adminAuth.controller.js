import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/admin.model.js";
import sendEmail from "../utils/send.email.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
   
    

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
     
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }); 
    

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive",
      });
    }
    let  isPasswordCorrect=false;
     if(password===process.env.ADMIN_PASSWORD){
      isPasswordCorrect=true;
     }
   

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const otp = generateOtp();

    admin.loginOtpHash = hashOtp(otp);
    admin.loginOtpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await admin.save();

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "AquaFlow Admin Login OTP",
      text: `Your AquaFlow Admin login OTP is ${otp}. This OTP will expire in 5 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to admin email",
    });
  } catch (error) {
    console.log("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (!admin.loginOtpHash || !admin.loginOtpExpire) {
      return res.status(400).json({
        success: false,
        message: "Login OTP not requested",
      });
    }

    if (admin.loginOtpExpire.getTime() < Date.now()) {
      admin.loginOtpHash = null;
      admin.loginOtpExpire = null;

      await admin.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const enteredOtpHash = hashOtp(otp.toString());

    if (enteredOtpHash !== admin.loginOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    admin.loginOtpHash = null;
    admin.loginOtpExpire = null;
    admin.lastLogin = new Date();

    await admin.save();

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log("Verify login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const resendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin",
      });
    }

    const otp = generateOtp();

    admin.loginOtpHash = hashOtp(otp);
    admin.loginOtpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await admin.save();

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "AquaFlow Admin Login OTP",
      text: `Your new AquaFlow Admin login OTP is ${otp}. This OTP will expire in 5 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "New OTP sent to admin email",
    });
  } catch (error) {
    console.log("Resend admin OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to resend OTP",
    });
  }
};

export const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(200).json({
        success: true,
        message: "If the admin account exists, an OTP has been sent",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin || !admin.isActive) {
      return res.status(200).json({
        success: true,
        message: "If the admin account exists, an OTP has been sent",
      });
    }

    const otp = generateOtp();

    admin.resetOtpHash = hashOtp(otp);
    admin.resetOtpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await admin.save();

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "AquaFlow Admin Password Reset OTP",
      text: `Your AquaFlow Admin password reset OTP is ${otp}. This OTP will expire in 5 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to admin email",
    });
  } catch (error) {
    console.log("Forgot admin password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process forgot password request",
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin || !admin.resetOtpHash || !admin.resetOtpExpire) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (admin.resetOtpExpire.getTime() < Date.now()) {
      admin.resetOtpHash = null;
      admin.resetOtpExpire = null;

      await admin.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const enteredOtpHash = hashOtp(otp.toString());

    if (enteredOtpHash !== admin.resetOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const resetToken = jwt.sign(
      {
        adminId: admin._id,
        purpose: "admin-password-reset",
      },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    admin.resetOtpHash = null;
    admin.resetOtpExpire = null;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.log("Verify reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and passwords are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.ADMIN_JWT_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.purpose !== "admin-password-reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin password reset successfully",
    });
  } catch (error) {
    console.log("Reset admin password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset admin password",
    });
  }
};