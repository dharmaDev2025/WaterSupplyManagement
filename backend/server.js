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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

console.log("Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS BLOCKED:", origin);

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Water Delivery API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);

app.use(
  "/api/admin/products",
  adminProductRoutes
);

app.use(
  "/api/admin/customers",
  adminCustomerRoutes
);

app.use(
  "/api/admin/delivery-boys",
  adminDeliveryBoyRoutes
);

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);

app.use(
  "/api/delivery/auth",
  deliveryAuthRoutes
);

app.use(
  "/api/delivery/orders",
  deliveryOrderRoutes
);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      `Server startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

startServer();
