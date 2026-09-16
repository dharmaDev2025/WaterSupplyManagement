import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
     
    },

  

    customerType: {
      type: String,
      enum: ["home", "office", "shop", "hotel"],
      default: "home",
    },

    address: {
      houseNo: {
        type: String,
        default: "",
      },

      street: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    passwordReset: {
  otpHash: {
    type: String,
    default: null,
  },

  expiresAt: {
    type: Date,
    default: null,
  },

  attempts: {
    type: Number,
    default: 0,
  },

  lastRequestedAt: {
    type: Date,
    default: null,
  },
},
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;