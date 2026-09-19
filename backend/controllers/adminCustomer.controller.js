import mongoose from "mongoose";
import Customer from "../models/customer.model.js";

export const getAllCustomers = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const customers = await Customer.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.log("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customers",
    });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findById(id).select(
      "-password"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.log("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer",
    });
  }
};

export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.isActive = isActive;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Customer activated successfully"
        : "Customer deactivated successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
      },
    });
  } catch (error) {
    console.log("Update customer status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update customer status",
    });
  }
};