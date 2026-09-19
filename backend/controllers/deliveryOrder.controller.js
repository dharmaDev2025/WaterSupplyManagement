import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model.js";
import sendEmail from "../utils/send.email.js";

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");
};

export const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryBoy: req.deliveryBoy._id,
      status: {
        $ne: "delivered",
      },
    })
      .populate("customer", "name phone email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.log("Get active orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch active orders",
    });
  }
};

export const getDeliveredOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryBoy: req.deliveryBoy._id,
      status: "delivered",
    })
      .populate("customer", "name phone email")
      .sort({ deliveredAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.log("Get delivered orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch delivered orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryBoy: req.deliveryBoy._id,
    })
      .populate("customer", "name phone email")
      .populate(
        "items.product",
        "name productType size unit"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    let mapUrl = null;

    if (
      order.deliveryLocation?.latitude !== undefined &&
      order.deliveryLocation?.longitude !== undefined
    ) {
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`;
    }

    return res.status(200).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,

        customer: {
          name: order.customer?.name,
          phone: order.customer?.phone,
          email: order.customer?.email,
        },

        deliveryAddress: order.deliveryAddress,

        deliveryLocation: order.deliveryLocation,

        mapUrl,

        items: order.items,

        totalAmount: order.totalAmount,

        paymentStatus: order.paymentStatus,

        status: order.status,

        assignedAt: order.deliveryBoyAssignedAt,

        createdAt: order.createdAt,

        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    console.log("Get delivery order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryBoy: req.deliveryBoy._id,
    }).populate("customer", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order is already delivered",
      });
    }

    if (order.status !== "out-for-delivery") {
      return res.status(400).json({
        success: false,
        message:
          "Order must be out for delivery before confirming delivery",
      });
    }

    if (!order.customer?.email) {
      return res.status(400).json({
        success: false,
        message: "Customer email is not available",
      });
    }

    const otp = generateOtp();

    order.deliveryOtpHash = hashOtp(otp);

    order.deliveryOtpExpire = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await order.save();

    try {
      await sendEmail({
        to: order.customer.email,
        subject: "AquaFlow Delivery Verification OTP",
        text: `Hello ${order.customer.name || "Customer"}, your AquaFlow delivery verification OTP is ${otp}. This OTP is valid for 5 minutes. Please share this OTP only after receiving your order.`,
      });
    } catch (emailError) {
      order.deliveryOtpHash = null;
      order.deliveryOtpExpire = null;

      await order.save();

      console.log(
        "Delivery OTP email error:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to send OTP to customer email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery OTP sent to customer email",
    });
  } catch (error) {
    console.log("Send delivery OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send delivery OTP",
    });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const otpValue = otp.toString().trim();

    if (!/^\d{6}$/.test(otpValue)) {
      return res.status(400).json({
        success: false,
        message: "OTP must contain exactly 6 digits",
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryBoy: req.deliveryBoy._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order is already delivered",
      });
    }

    if (order.status !== "out-for-delivery") {
      return res.status(400).json({
        success: false,
        message: "Order is not out for delivery",
      });
    }

    if (
      !order.deliveryOtpHash ||
      !order.deliveryOtpExpire
    ) {
      return res.status(400).json({
        success: false,
        message: "Please send delivery OTP first",
      });
    }

    if (
      new Date(order.deliveryOtpExpire).getTime() <
      Date.now()
    ) {
      order.deliveryOtpHash = null;
      order.deliveryOtpExpire = null;

      await order.save();

      return res.status(400).json({
        success: false,
        message:
          "Delivery OTP has expired. Please send a new OTP",
      });
    }

    const enteredOtpHash = hashOtp(otpValue);

    if (enteredOtpHash !== order.deliveryOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    order.status = "delivered";

    order.deliveredAt = new Date();

    order.deliveryOtpHash = null;

    order.deliveryOtpExpire = null;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Delivery completed successfully",

      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    console.log("Verify delivery OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify delivery OTP",
    });
  }
};