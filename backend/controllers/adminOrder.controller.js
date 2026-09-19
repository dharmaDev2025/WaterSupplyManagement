import mongoose from "mongoose";
import Order from "../models/order.model.js";
import DeliveryBoy from "../models/deliveryBoy.model.js";

export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .populate("deliveryBoy", "name email phone age isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.log("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
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

    const order = await Order.findById(id)
      .populate("customer", "name email phone")
      .populate("deliveryBoy", "name email phone age isActive")
      .populate("items.product", "name productType size unit");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("Get order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order details",
    });
  }
};

export const assignDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryBoyId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (
      !deliveryBoyId ||
      !mongoose.Types.ObjectId.isValid(deliveryBoyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid delivery boy ID is required",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign delivery boy to a delivered order",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(
      deliveryBoyId
    );

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    if (!deliveryBoy.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign an inactive delivery boy",
      });
    }

    order.deliveryBoy = deliveryBoy._id;
    order.deliveryBoyAssignedAt = new Date();

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate(
        "deliveryBoy",
        "name email phone age isActive"
      );

    return res.status(200).json({
      success: true,
      message: "Delivery boy assigned successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("Assign delivery boy error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign delivery boy",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "confirmed",
      "packed",
      "out-for-delivery",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be confirmed, packed or out-for-delivery",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order status cannot be changed",
      });
    }

    if (
      status === "out-for-delivery" &&
      !order.deliveryBoy
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Assign a delivery boy before marking order out for delivery",
      });
    }

    order.status = status;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate(
        "deliveryBoy",
        "name email phone age isActive"
      );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update order status",
    });
  }
};