import mongoose from "mongoose";
import crypto from "node:crypto";

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";


// =====================================================
// HELPER FUNCTION
// Validate products + calculate total
// =====================================================

const calculateOrder = async (items) => {

  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error("At least one product is required");
  }

  const orderItems = [];

  let totalAmount = 0;
  let emptyJarsExpected = 0;


  // Process every selected product
  for (const item of items) {

    const {
      productId,
      purchaseType,
      quantity,
    } = item;


    // -------------------------------------
    // Basic validation
    // -------------------------------------

    if (!productId || !purchaseType || !quantity) {
      throw new Error(
        "productId, purchaseType and quantity are required"
      );
    }


    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error(
        "Quantity must be a positive integer"
      );
    }


    // Validate MongoDB ID
    if (
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      throw new Error("Invalid product ID");
    }


    // -------------------------------------
    // Find product
    // -------------------------------------

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });


    if (!product) {
      throw new Error("Product not found");
    }


    // -------------------------------------
    // Check stock
    // -------------------------------------

    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}`
      );
    }


    let price = 0;


    // =====================================
    // JAR
    // =====================================

    if (product.productType === "jar") {

      // -----------------------------------
      // NEW JAR + WATER
      // -----------------------------------

      if (purchaseType === "new-jar") {

        if (product.newJarPrice === null) {
          throw new Error(
            `New jar purchase is not available for ${product.name}`
          );
        }

        price = product.newJarPrice;
      }


      // -----------------------------------
      // REFILL
      // -----------------------------------

      else if (purchaseType === "refill") {

        if (product.refillPrice === null) {
          throw new Error(
            `Refill is not available for ${product.name}`
          );
        }

        price = product.refillPrice;

        // Customer must return empty jar
        emptyJarsExpected += quantity;
      }


      else {
        throw new Error(
          `${product.name} supports only new-jar or refill`
        );
      }
    }


    // =====================================
    // BOTTLE
    // =====================================

    else if (product.productType === "bottle") {

      if (purchaseType !== "bottle") {
        throw new Error(
          `${product.name} supports only bottle purchase`
        );
      }


      if (product.bottlePrice === null) {
        throw new Error(
          `Price is not available for ${product.name}`
        );
      }


      price = product.bottlePrice;
    }


    // -------------------------------------
    // Calculate subtotal
    // -------------------------------------

    const subtotal = price * quantity;

    totalAmount += subtotal;


    // Product snapshot for final order
    orderItems.push({
      product: product._id,
      name: product.name,
      purchaseType,
      quantity,
      price,
      subtotal,
    });
  }


  return {
    orderItems,
    totalAmount,
    emptyJarsExpected,
  };
};



// =====================================================
// 1. CREATE RAZORPAY ORDER
// POST /api/orders/create-payment
//
// IMPORTANT:
// This DOES NOT save an Order in MongoDB.
// =====================================================

export const createRazorpayOrder = async (req, res) => {

  try {

    const { items } = req.body;

    const customer = req.customer;


    // -------------------------------------
    // Check customer address
    // -------------------------------------

    if (
      !customer.address?.houseNo ||
      !customer.address?.street ||
      !customer.address?.city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please add delivery address before placing order",
      });
    }


    // -------------------------------------
    // Check customer location
    // -------------------------------------

    if (
      customer.location?.latitude === null ||
      customer.location?.latitude === undefined ||
      customer.location?.longitude === null ||
      customer.location?.longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please add delivery location before placing order",
      });
    }


    // -------------------------------------
    // Validate products and calculate price
    // -------------------------------------

    const {
      totalAmount,
    } = await calculateOrder(items);


    // Razorpay uses paise
    //
    // ₹240
    //   ↓
    // 24000 paise

    const amountInPaise =
      Math.round(totalAmount * 100);


    // -------------------------------------
    // Create Razorpay Order
    // -------------------------------------

    const razorpayOrder =
      await razorpay.orders.create({

        amount: amountInPaise,

        currency: "INR",

        receipt:
          `PAY-${Date.now()}`,
      });


    // IMPORTANT:
    //
    // NO Order.create() HERE
    //
    // Payment has not happened yet.


    return res.status(200).json({

      success: true,

      message:
        "Payment initiated successfully",

      key:
        process.env.RAZORPAY_KEY_ID,

      razorpayOrderId:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });

  }

  catch (error) {

    console.error(
      "Create Razorpay Order Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to initiate payment",
    });
  }
};



// =====================================================
// 2. VERIFY PAYMENT + CREATE REAL ORDER
// POST /api/orders/verify-payment
//
// Order is saved ONLY HERE.
// =====================================================

export const verifyRazorpayPayment = async (
  req,
  res
) => {

  try {

    const {
      items,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;


    const customer = req.customer;


    // -------------------------------------
    // Check required payment information
    // -------------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification details are required",
      });
    }


    // -------------------------------------
    // Prevent duplicate order creation
    // -------------------------------------

    const existingOrder =
      await Order.findOne({
        razorpayPaymentId:
          razorpay_payment_id,
      });


    if (existingOrder) {

      return res.status(200).json({
        success: true,
        message:
          "Order already placed successfully",
        order: existingOrder,
      });
    }


    // =====================================
    // VERIFY RAZORPAY SIGNATURE
    // =====================================

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;


    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");


    if (
      expectedSignature !==
      razorpay_signature
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed",
      });
    }


    // =====================================
    // FETCH RAZORPAY ORDER
    // =====================================

    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpay_order_id
      );


    // =====================================
    // FETCH RAZORPAY PAYMENT
    // =====================================

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );


    // -------------------------------------
    // Payment must belong to this
    // Razorpay Order
    // -------------------------------------

    if (
      razorpayPayment.order_id !==
      razorpay_order_id
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Payment does not belong to this Razorpay order",
      });
    }


    // =====================================
    // VALIDATE PRODUCTS AGAIN
    // =====================================

    const {
      orderItems,
      totalAmount,
      emptyJarsExpected,
    } = await calculateOrder(items);


    // Convert calculated total to paise
    const expectedAmount =
      Math.round(totalAmount * 100);


    // =====================================
    // CHECK RAZORPAY ORDER AMOUNT
    // =====================================

    if (
      Number(razorpayOrder.amount) !==
      expectedAmount
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Order amount does not match calculated amount",
      });
    }


    // =====================================
    // CHECK ACTUAL PAYMENT AMOUNT
    // =====================================

    if (
      Number(razorpayPayment.amount) !==
      expectedAmount
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Paid amount does not match order amount",
      });
    }


    // =====================================
    // CHECK PAYMENT STATUS
    // =====================================

    if (
      razorpayPayment.status !== "captured" &&
      razorpayPayment.status !== "authorized"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Payment is not successful",
      });
    }


    // -------------------------------------
    // Check address again
    // -------------------------------------

    if (
      !customer.address?.houseNo ||
      !customer.address?.street ||
      !customer.address?.city
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Delivery address is required",
      });
    }


    // -------------------------------------
    // Check location again
    // -------------------------------------

    if (
      customer.location?.latitude === null ||
      customer.location?.latitude === undefined ||
      customer.location?.longitude === null ||
      customer.location?.longitude === undefined
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Delivery location is required",
      });
    }


    // =====================================
    // GENERATE ORDER NUMBER
    // =====================================

    const orderNumber =
      "ORD-" +
      Date.now() +
      "-" +
      Math.floor(
        1000 + Math.random() * 9000
      );


    // =====================================
    // PAYMENT SUCCESSFUL
    //
    // NOW SAVE ORDER IN MONGODB
    // =====================================

    const order = await Order.create({

      orderNumber,

      customer:
        customer._id,

      items:
        orderItems,

      totalAmount,

      deliveryAddress: {

        houseNo:
          customer.address.houseNo,

        street:
          customer.address.street,

        city:
          customer.address.city,
      },

      deliveryLocation: {

        latitude:
          customer.location.latitude,

        longitude:
          customer.location.longitude,
      },

      status:
        "confirmed",

      paymentStatus:
        "paid",

      razorpayOrderId:
        razorpay_order_id,

      razorpayPaymentId:
        razorpay_payment_id,

      paidAt:
        new Date(),

      emptyJarsExpected,

      emptyJarsReceived:
        0,
    });


    // =====================================
    // FINAL RESPONSE
    // =====================================

    return res.status(201).json({

      success: true,

      message:
        "Payment successful. Order placed successfully.",

      order,
    });

  }

  catch (error) {

    console.error(
      "Verify Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to verify payment",
    });
  }
};



// =====================================================
// 3. GET LOGGED-IN CUSTOMER ORDERS
// GET /api/orders/my-orders
// =====================================================

export const getMyOrders = async (req, res) => {

  try {

    const orders = await Order.find({
      customer: req.customer._id,
    })
      .populate(
        "items.product",
        "name productType size unit"
      )
      .sort({
        createdAt: -1,
      });


    return res.status(200).json({

      success: true,

      count:
        orders.length,

      orders,
    });

  }

  catch (error) {

    console.error(
      "Get My Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch orders",
    });
  }
};



// =====================================================
// 4. GET SINGLE ORDER
// GET /api/orders/:id
// =====================================================

export const getOrderById = async (req, res) => {

  try {

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }


    const order =
      await Order.findOne({

        _id:
          req.params.id,

        customer:
          req.customer._id,

      }).populate(
        "items.product",
        "name productType size unit"
      );


    if (!order) {

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }


    return res.status(200).json({

      success: true,

      order,
    });

  }

  catch (error) {

    console.error(
      "Get Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch order",
    });
  }
};



// =====================================================
// 5. GET ONLY ORDER STATUS
// GET /api/orders/:id/status
// =====================================================

export const getOrderStatus = async (
  req,
  res
) => {

  try {

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }


    const order =
      await Order.findOne({

        _id:
          req.params.id,

        customer:
          req.customer._id,

      }).select(
        "orderNumber status paymentStatus createdAt deliveredAt"
      );


    if (!order) {

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }


    return res.status(200).json({

      success: true,

      order: {

        orderNumber:
          order.orderNumber,

        status:
          order.status,

        paymentStatus:
          order.paymentStatus,

        orderDate:
          order.createdAt,

        deliveredAt:
          order.deliveredAt,
      },
    });

  }

  catch (error) {

    console.error(
      "Get Order Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch order status",
    });
  }
};



// =====================================================
// 6. REORDER
// POST /api/orders/:id/reorder
// =====================================================

export const reorder = async (req, res) => {

  try {

    // Validate old order ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }


    // Find customer's previous order
    const oldOrder =
      await Order.findOne({

        _id:
          req.params.id,

        customer:
          req.customer._id,
      });


    if (!oldOrder) {

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }


    // =====================================
    // IMPORTANT
    //
    // We DON'T copy:
    //
    // old price
    // old subtotal
    // old totalAmount
    //
    // Current prices will be calculated
    // when /create-payment is called.
    // =====================================


    const items =
      oldOrder.items.map(
        (item) => ({

          productId:
            item.product.toString(),

          purchaseType:
            item.purchaseType,

          quantity:
            item.quantity,
        })
      );


    return res.status(200).json({

      success: true,

      message:
        "Reorder items prepared successfully",

      items,
    });

  }

  catch (error) {

    console.error(
      "Reorder Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to prepare reorder",
    });
  }
};