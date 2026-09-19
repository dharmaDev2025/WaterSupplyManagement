import jwt from "jsonwebtoken";
import DeliveryBoy from "../models/deliveryBoy.model.js";

export const protectDeliveryBoy = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Delivery boy authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Delivery boy token not found",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.DELIVERY_JWT_SECRET
    );

    if (decoded.role !== "deliveryBoy") {
      return res.status(403).json({
        success: false,
        message: "Delivery boy access only",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(
      decoded.deliveryBoyId
    ).select("-password");

    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    if (!deliveryBoy.isActive) {
      return res.status(403).json({
        success: false,
        message: "Delivery boy account is inactive",
      });
    }

    req.deliveryBoy = deliveryBoy;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid delivery boy token",
      });
    }

    console.log("Delivery authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Delivery boy authentication failed",
    });
  }
};