import express from "express";
import { orderControllers } from "../controllers/order-controller.js"
const router = express.Router();

router.route("/create", orderControllers.createOrder)

export default router;