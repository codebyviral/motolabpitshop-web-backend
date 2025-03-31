import express from "express";
import { orderControllers } from "../controllers/order-controller.js";
const router = express.Router();

router.post("/create", orderControllers.createOrder);
router.post("/create-guest-order", orderControllers.guestCheckout);
router.get("/featured-products", orderControllers.generateFeatureProducts);
router.get("/user-order", orderControllers.getUserOrders);
router.get("/status", orderControllers.getOrderStatus);

export default router;
