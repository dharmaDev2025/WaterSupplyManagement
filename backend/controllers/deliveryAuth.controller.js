import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DeliveryBoy from "../models/deliveryBoy.model.js";

export const deliveryBoyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const deliveryBoy = await DeliveryBoy.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!deliveryBoy.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact admin",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      deliveryBoy.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        deliveryBoyId: deliveryBoy._id,
        role: "deliveryBoy",
      },
      process.env.DELIVERY_JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Delivery boy login successful",
      token,
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        age: deliveryBoy.age,
        isActive: deliveryBoy.isActive,
      },
    });
  } catch (error) {
    console.log("Delivery boy login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};