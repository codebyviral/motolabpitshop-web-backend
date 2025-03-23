import express from "express";
import { orderControllers } from "../controllers/order-controller.js"
const router = express.Router();

router.post("/create", orderControllers.createOrder)
router.get("/featured-products", orderControllers.generateFeatureProducts)

export default router;