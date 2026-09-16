import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js"
import connectDB from "./config/db.js";
import orderRoutes from "./routes/order.routes.js";
dotenv.config();


import "./config/passport.js";

// Routes
import authRoutes from "./routes/auth.routes.js";



const app = express();



app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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



app.use("/api/auth", authRoutes);
app.use(
  "/api/customers",
  customerRoutes
);
app.use("/api/products",productRoutes)
app.use("/api/orders", orderRoutes);


const PORT = process.env.PORT || 5000;



const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
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