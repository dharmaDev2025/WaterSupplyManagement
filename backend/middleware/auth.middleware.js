import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const protectCustomer = async (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check token exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

 
    const token = authHeader.split(" ")[1];

    // 4. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 5. Find customer using customerId stored inside JWT
    const customer = await Customer.findById(
      decoded.customerId
    ).select("-password -passwordReset");

    // 6. If customer not found
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 7. Check account active
    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Customer account is inactive",
      });
    }

    // 8. Store customer in req
    req.customer = customer;

    // 9. Move to next controller
    next();

  } catch (error) {

    // Token expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // Invalid token
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};