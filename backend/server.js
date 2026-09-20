import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import connectDB from "./config/db.js";
import orderRoutes from "./routes/order.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminCustomerRoutes from "./routes/adminCustomer.routes.js";
import adminDeliveryBoyRoutes from "./routes/adminDeliveryBoy.routes.js";
import deliveryAuthRoutes from "./routes/deliveryAuth.routes.js";
import deliveryOrderRoutes from "./routes/deliveryOrder.routes.js";
import adminOrderRoutes from "./routes/adminOrder.route.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

import "./config/passport.js";

const app = express();
app.set("trust proxy", 1);

/* =====================================================
   CORS CONFIGURATION
===================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

app.use(passport.initialize());

/* =====================================================
   TEST ROUTE
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Water Delivery API is running",
  });
});

/* =====================================================
   CUSTOMER AUTH
===================================================== */

app.use(
  "/api/auth",
  authRoutes
);

/* =====================================================
   CUSTOMER
===================================================== */

app.use(
  "/api/customers",
  customerRoutes
);

/* =====================================================
   PRODUCTS
===================================================== */

app.use(
  "/api/products",
  productRoutes
);

/* =====================================================
   ORDERS
===================================================== */

app.use(
  "/api/orders",
  orderRoutes
);

/* =====================================================
   ADMIN AUTH
===================================================== */

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);

/* =====================================================
   ADMIN PRODUCTS
===================================================== */

app.use(
  "/api/admin/products",
  adminProductRoutes
);

/* =====================================================
   ADMIN CUSTOMERS
===================================================== */

app.use(
  "/api/admin/customers",
  adminCustomerRoutes
);

/* =====================================================
   ADMIN DELIVERY BOYS
===================================================== */

app.use(
  "/api/admin/delivery-boys",
  adminDeliveryBoyRoutes
);

/* =====================================================
   ADMIN ORDERS
===================================================== */

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);

/* =====================================================
   DELIVERY AUTH
===================================================== */

app.use(
  "/api/delivery/auth",
  deliveryAuthRoutes
);

/* =====================================================
   DELIVERY ORDERS
===================================================== */

app.use(
  "/api/delivery/orders",
  deliveryOrderRoutes
);

/* =====================================================
   404
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* =====================================================
   ERROR HANDLER
===================================================== */

app.use((error, req, res, next) => {
  console.error("Server Error:", error.message);

  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

/* =====================================================
   START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      `Server startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

startServer();
