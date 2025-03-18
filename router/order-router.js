import express from "express";
import { orderControllers } from "../controllers/order-controller.js"
const router = express.Router();

router.route("/create", orderControllers.createOrder)
router.get("/product", orderControllers.getProductById)
router.get("/featured-products", orderControllers.generateFeatureProducts)

export default router;