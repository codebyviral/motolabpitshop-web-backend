// ========================== Imports =========================== //
import express from "express";
import { connectToDataBase } from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
// ========================== Router Imports =========================== //
import adminRouter from "./router/admin-router.js";
import authRouter from "./router/auth-router.js";
import orderRouter from "./router/order-router.js";
import paymentRouter from "./router/payment-router.js";
import Productrouter from "./router/product-router.js";
import userRouter from "./router/user-router.js";
// ========================== Sessions & Middleware =========================== //
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-google-oauth2";
// ========================== DB Models =========================== //
import { User } from "./models/user.model.js";
// ========================== Payment Gateway =========================== //
import Razorpay from "razorpay";

const app = express();
const port = process.env.PORT || 8000;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const devFrontendUrl = process.env.DEV_FRONTEND_URL;

const corsOptions = {
  origin: [
    "https://motolabpitshop.vercel.app",
    "https://motolab-admin.vercel.app",
  ],
  // origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: "GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
  exposedHeaders: ["Authorization"],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('/tmp', { index: false }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use(cookieParser());

// ========================== LIST OF ALL APIS ========================== //

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/search", orderRouter);
app.use("/api/get", orderRouter);
app.use("/api/order", orderRouter);
app.use("/api/product", Productrouter);
app.use("/api/get-user", userRouter);

// ========================== RAZORPAY SETUP ========================== //

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use("/api", paymentRouter);

app.use("/api/get-key", (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

app.get("/", (req, res) => {
  console.log(`Someone said hi to our backend server.`);
  res.send(`This is Motolabpitshop Backend server`);
});

(async () => {
  try {
    await connectToDataBase();
    console.log(`Almost there...`);
    app.listen(port, () => {
      console.log(`Motolabpitshop Server is running on port: ${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

export default app;
