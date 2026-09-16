import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        purchaseType: {
          type: String,
          enum: ["new-jar", "refill", "bottle"],
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
        },

        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    deliveryAddress: {
      houseNo: {
        type: String,
        required: true,
      },

      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },
    },

    deliveryLocation: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    status: {
      type: String,
      enum: [
        "confirmed",
        "packed",
        "out-for-delivery",
        "delivered",
      ],
      default: "confirmed",
    },

    paymentStatus: {
      type: String,
      enum: ["paid"],
      default: "paid",
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },

    paidAt: {
      type: Date,
      required: true,
    },

    emptyJarsExpected: {
      type: Number,
      default: 0,
    },

    emptyJarsReceived: {
      type: Number,
      default: 0,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;