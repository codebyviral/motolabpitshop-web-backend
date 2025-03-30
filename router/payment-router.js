import express from "express";
import {
  checkout,
  paymentVerification,
  updatePaymentStatus,
} from "../controllers/payment-controller.js";

const router = express.Router();

router.route("/checkout").post(checkout);
router.route("/payment-verification").post(paymentVerification);
router.route("/update-payment-status").post(updatePaymentStatus);

export default router;
