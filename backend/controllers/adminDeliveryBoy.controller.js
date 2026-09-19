import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import DeliveryBoy from "../models/deliveryBoy.model.js";
import Order from "../models/order.model.js";

export const addDeliveryBoy = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      age,
    } = req.body;

    if (!name || !email || !phone || !password || !age) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (Number(age) < 18) {
      return res.status(400).json({
        success: false,
        message: "Delivery boy must be at least 18 years old",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await DeliveryBoy.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Delivery boy with this email already exists",
      });
    }

    const existingPhone = await DeliveryBoy.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Delivery boy with this phone number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const deliveryBoy = await DeliveryBoy.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      age,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Delivery boy added successfully",
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        age: deliveryBoy.age,
        isActive: deliveryBoy.isActive,
        createdAt: deliveryBoy.createdAt,
      },
    });
  } catch (error) {
    console.log("Add delivery boy error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add delivery boy",
    });
  }
};

export const getAllDeliveryBoys = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const deliveryBoys = await DeliveryBoy.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const deliveryBoysWithOrders = await Promise.all(
      deliveryBoys.map(async (deliveryBoy) => {
        const totalOrders = await Order.countDocuments({
          deliveryBoy: deliveryBoy._id,
        });

        const activeOrders = await Order.countDocuments({
          deliveryBoy: deliveryBoy._id,
          status: {
            $ne: "delivered",
          },
        });

        const deliveredOrders = await Order.countDocuments({
          deliveryBoy: deliveryBoy._id,
          status: "delivered",
        });

        return {
          ...deliveryBoy,
          totalOrders,
          activeOrders,
          deliveredOrders,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: deliveryBoysWithOrders.length,
      deliveryBoys: deliveryBoysWithOrders,
    });
  } catch (error) {
    console.log("Get delivery boys error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch delivery boys",
    });
  }
};

export const getDeliveryBoyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(id)
      .select("-password")
      .lean();

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    const totalOrders = await Order.countDocuments({
      deliveryBoy: id,
    });

    const activeOrders = await Order.countDocuments({
      deliveryBoy: id,
      status: {
        $ne: "delivered",
      },
    });

    const deliveredOrders = await Order.countDocuments({
      deliveryBoy: id,
      status: "delivered",
    });

    return res.status(200).json({
      success: true,
      deliveryBoy: {
        ...deliveryBoy,
        totalOrders,
        activeOrders,
        deliveredOrders,
      },
    });
  } catch (error) {
    console.log("Get delivery boy error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch delivery boy",
    });
  }
};

export const updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      age,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    if (age !== undefined && Number(age) < 18) {
      return res.status(400).json({
        success: false,
        message: "Delivery boy must be at least 18 years old",
      });
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingEmail = await DeliveryBoy.findOne({
        email: normalizedEmail,
        _id: {
          $ne: id,
        },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Another delivery boy is already using this email",
        });
      }

      deliveryBoy.email = normalizedEmail;
    }

    if (phone !== undefined) {
      const existingPhone = await DeliveryBoy.findOne({
        phone: phone.trim(),
        _id: {
          $ne: id,
        },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Another delivery boy is already using this phone number",
        });
      }

      deliveryBoy.phone = phone.trim();
    }

    if (name !== undefined) {
      deliveryBoy.name = name;
    }

    if (age !== undefined) {
      deliveryBoy.age = age;
    }

    await deliveryBoy.save();

    return res.status(200).json({
      success: true,
      message: "Delivery boy updated successfully",
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
    console.log("Update delivery boy error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update delivery boy",
    });
  }
};

export const updateDeliveryBoyPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      newPassword,
      confirmPassword,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required",
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
        message: "Password must be at least 6 characters",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    deliveryBoy.password = hashedPassword;

    await deliveryBoy.save();

    return res.status(200).json({
      success: true,
      message: "Delivery boy password updated successfully",
    });
  } catch (error) {
    console.log("Update delivery boy password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update delivery boy password",
    });
  }
};

export const updateDeliveryBoyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    deliveryBoy.isActive = isActive;

    await deliveryBoy.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Delivery boy activated successfully"
        : "Delivery boy deactivated successfully",
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
    console.log("Update delivery boy status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update delivery boy status",
    });
  }
};