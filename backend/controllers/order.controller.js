import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import stripe from "../config/stripe.js";

const calculateOrder = async (items) => {
  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "At least one product is required"
    );
  }

  const orderItems = [];
  let totalAmount = 0;
  let emptyJarsExpected = 0;

  for (const item of items) {
    const {
      productId,
      purchaseType,
      quantity,
    } = item;

    if (
      !productId ||
      !purchaseType ||
      !quantity
    ) {
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

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      throw new Error(
        "Invalid product ID"
      );
    }

    const product =
      await Product.findOne({
        _id: productId,
        isActive: true,
      });

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    if (
      product.stock < quantity
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}`
      );
    }

    let price = 0;

    if (
      product.productType === "jar"
    ) {
      if (
        purchaseType === "new-jar"
      ) {
        if (
          product.newJarPrice === null ||
          product.newJarPrice ===
            undefined
        ) {
          throw new Error(
            `New jar purchase is not available for ${product.name}`
          );
        }

        price =
          product.newJarPrice;
      } else if (
        purchaseType === "refill"
      ) {
        if (
          product.refillPrice === null ||
          product.refillPrice ===
            undefined
        ) {
          throw new Error(
            `Refill is not available for ${product.name}`
          );
        }

        price =
          product.refillPrice;

        emptyJarsExpected +=
          quantity;
      } else {
        throw new Error(
          `${product.name} supports only new-jar or refill`
        );
      }
    } else if (
      product.productType ===
      "bottle"
    ) {
      if (
        purchaseType !== "bottle"
      ) {
        throw new Error(
          `${product.name} supports only bottle purchase`
        );
      }

      if (
        product.bottlePrice === null ||
        product.bottlePrice ===
          undefined
      ) {
        throw new Error(
          `Price is not available for ${product.name}`
        );
      }

      price =
        product.bottlePrice;
    } else {
      throw new Error(
        "Invalid product type"
      );
    }

    const subtotal =
      price * quantity;

    totalAmount +=
      subtotal;

    orderItems.push({
      product:
        product._id,
      name:
        product.name,
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

const validateDeliveryDetails = (
  deliveryAddress,
  deliveryLocation
) => {
  if (
    !deliveryAddress ||
    !deliveryAddress.houseNo?.trim() ||
    !deliveryAddress.street?.trim() ||
    !deliveryAddress.city?.trim()
  ) {
    throw new Error(
      "Complete delivery address is required"
    );
  }

  if (
    !deliveryLocation ||
    deliveryLocation.latitude ===
      null ||
    deliveryLocation.latitude ===
      undefined ||
    deliveryLocation.longitude ===
      null ||
    deliveryLocation.longitude ===
      undefined
  ) {
    throw new Error(
      "Exact delivery location is required"
    );
  }

  const latitude =
    Number(
      deliveryLocation.latitude
    );

  const longitude =
    Number(
      deliveryLocation.longitude
    );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      "Invalid delivery coordinates"
    );
  }

  if (
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(
      "Invalid delivery latitude"
    );
  }

  if (
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Invalid delivery longitude"
    );
  }

  return {
    deliveryAddress: {
      houseNo:
        deliveryAddress.houseNo.trim(),
      street:
        deliveryAddress.street.trim(),
      city:
        deliveryAddress.city.trim(),
    },

    deliveryLocation: {
      latitude,
      longitude,
    },
  };
};

export const createStripeSession =
  async (req, res) => {
    try {
      const {
        items,
        deliveryAddress,
        deliveryLocation,
      } = req.body;

      const customer =
        req.customer;

      const validatedDelivery =
        validateDeliveryDetails(
          deliveryAddress,
          deliveryLocation
        );

      const {
        orderItems,
        totalAmount,
        emptyJarsExpected,
      } = await calculateOrder(
        items
      );

      const lineItems =
        orderItems.map(
          (item) => ({
            price_data: {
              currency: "inr",

              product_data: {
                name:
                  item.name,

                description:
                  item.purchaseType,
              },

              unit_amount:
                Math.round(
                  item.price * 100
                ),
            },

            quantity:
              item.quantity,
          })
        );

      const session =
        await stripe.checkout.sessions.create(
          {
            mode: "payment",

            payment_method_types: [
              "card",
            ],

            line_items:
              lineItems,

            customer_email:
              customer.email,

            success_url:
              `${process.env.CLIENT_URL}/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,

            cancel_url:
              `${process.env.CLIENT_URL}/checkout?payment=cancelled`,

            metadata: {
              customerId:
                customer._id.toString(),

              items:
                JSON.stringify(
                  items
                ),

              houseNo:
                validatedDelivery
                  .deliveryAddress
                  .houseNo,

              street:
                validatedDelivery
                  .deliveryAddress
                  .street,

              city:
                validatedDelivery
                  .deliveryAddress
                  .city,

              latitude:
                String(
                  validatedDelivery
                    .deliveryLocation
                    .latitude
                ),

              longitude:
                String(
                  validatedDelivery
                    .deliveryLocation
                    .longitude
                ),

              emptyJarsExpected:
                String(
                  emptyJarsExpected
                ),
            },
          }
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Payment initiated successfully",

          sessionId:
            session.id,

          url:
            session.url,

          amount:
            totalAmount,

          currency:
            "INR",
        });
    } catch (error) {
      console.error(
        "Create Stripe Session Error:",
        error
      );

      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Unable to initiate payment",
        });
    }
  };

export const verifyStripePayment =
  async (req, res) => {
    try {
      const {
        sessionId,
      } = req.body;

      const customer =
        req.customer;

      if (!sessionId) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Stripe session ID is required",
          });
      }

      const existingOrder =
        await Order.findOne({
          stripeSessionId:
            sessionId,
        });

      if (existingOrder) {
        if (
          existingOrder.customer.toString() !==
          customer._id.toString()
        ) {
          return res
            .status(403)
            .json({
              success: false,

              message:
                "This payment does not belong to this customer",
            });
        }

        return res
          .status(200)
          .json({
            success: true,

            message:
              "Order already placed successfully",

            order:
              existingOrder,
          });
      }

      const session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );

      if (
        !session ||
        session.payment_status !==
          "paid"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Payment is not successful",
          });
      }

      if (
        !session.metadata ||
        session.metadata.customerId !==
          customer._id.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "This payment does not belong to this customer",
          });
      }

      if (
        !session.metadata.items
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Order information is missing from payment",
          });
      }

      const items =
        JSON.parse(
          session.metadata.items
        );

      const {
        orderItems,
        totalAmount,
        emptyJarsExpected,
      } = await calculateOrder(
        items
      );

      const expectedAmount =
        Math.round(
          totalAmount * 100
        );

      if (
        Number(
          session.amount_total
        ) !== expectedAmount
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Paid amount does not match order amount",
          });
      }

      const deliveryAddress = {
        houseNo:
          session.metadata.houseNo,

        street:
          session.metadata.street,

        city:
          session.metadata.city,
      };

      const deliveryLocation = {
        latitude:
          Number(
            session.metadata.latitude
          ),

        longitude:
          Number(
            session.metadata.longitude
          ),
      };

      const validatedDelivery =
        validateDeliveryDetails(
          deliveryAddress,
          deliveryLocation
        );

      const orderNumber =
        "ORD-" +
        Date.now() +
        "-" +
        Math.floor(
          1000 +
            Math.random() *
              9000
        );

      const order =
        await Order.create({
          orderNumber,

          customer:
            customer._id,

          items:
            orderItems,

          totalAmount,

          deliveryAddress:
            validatedDelivery
              .deliveryAddress,

          deliveryLocation:
            validatedDelivery
              .deliveryLocation,

          status:
            "confirmed",

          paymentStatus:
            "paid",

          stripeSessionId:
            session.id,

          stripePaymentIntentId:
            typeof session.payment_intent ===
            "string"
              ? session.payment_intent
              : null,

          paidAt:
            new Date(),

          emptyJarsExpected,

          emptyJarsReceived:
            0,
        });

      for (
        const item of orderItems
      ) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock:
                -item.quantity,
            },
          }
        );
      }

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Payment successful. Order placed successfully.",

          order,
        });
    } catch (error) {
      console.error(
        "Verify Stripe Payment Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Unable to verify payment",
        });
    }
  };

export const getMyOrders =
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          customer:
            req.customer._id,
        })
          .populate(
            "items.product",
            "name productType size unit"
          )
          .sort({
            createdAt: -1,
          });

      return res
        .status(200)
        .json({
          success: true,

          count:
            orders.length,

          orders,
        });
    } catch (error) {
      console.error(
        "Get My Orders Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to fetch orders",
        });
    }
  };

export const getOrderById =
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
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
        })
          .populate(
            "items.product",
            "name productType size unit"
          )
          .populate(
            "deliveryBoy",
            "name phone"
          );

      if (!order) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Order not found",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          order,
        });
    } catch (error) {
      console.error(
        "Get Order Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to fetch order",
        });
    }
  };

export const getOrderStatus =
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
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
        })
          .select(
            "orderNumber status paymentStatus createdAt deliveredAt deliveryBoy"
          )
          .populate(
            "deliveryBoy",
            "name phone"
          );

      if (!order) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Order not found",
          });
      }

      return res
        .status(200)
        .json({
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

            deliveryBoy:
              order.deliveryBoy
                ? {
                    name:
                      order
                        .deliveryBoy
                        .name,

                    phone:
                      order
                        .deliveryBoy
                        .phone,
                  }
                : null,
          },
        });
    } catch (error) {
      console.error(
        "Get Order Status Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to fetch order status",
        });
    }
  };

export const reorder =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid order ID",
          });
      }

      const oldOrder =
        await Order.findOne({
          _id: id,
          customer:
            req.customer._id,
        }).populate(
          "items.product",
          "name productType size unit stock newJarPrice refillPrice bottlePrice isActive"
        );

      if (!oldOrder) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Order not found",
          });
      }

      const items = [];

      for (
        const item of oldOrder.items
      ) {
        const product =
          item.product;

        if (!product) {
          return res
            .status(404)
            .json({
              success: false,
              message:
                `${item.name} is no longer available`,
            });
        }

        if (
          product.isActive ===
          false
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                `${product.name} is currently unavailable`,
            });
        }

        if (
          product.stock <
          item.quantity
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                `Only ${product.stock} unit(s) of ${product.name} are available`,
            });
        }

        let price;

        if (
          product.productType ===
            "jar" &&
          item.purchaseType ===
            "new-jar"
        ) {
          price =
            product.newJarPrice;
        } else if (
          product.productType ===
            "jar" &&
          item.purchaseType ===
            "refill"
        ) {
          price =
            product.refillPrice;
        } else {
          price =
            product.bottlePrice;
        }

        if (
          price === undefined ||
          price === null
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                `Price is not available for ${product.name}`,
            });
        }

        items.push({
          productId:
            product._id.toString(),
          name:
            product.name,
          productType:
            product.productType,
          purchaseType:
            item.purchaseType,
          quantity:
            item.quantity,
          price,
          size:
            product.size,
          unit:
            product.unit,
          stock:
            product.stock,
        });
      }

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Reorder items prepared successfully",
          items,
        });
    } catch (error) {
      console.log(
        "Reorder error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to prepare reorder",
        });
    }
  };