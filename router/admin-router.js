import express from "express";
import { adminControllers } from "../controllers/admin-controller.js";
import verifyJWT from "../middlewares/auth.middlewares.js";
import verifyAdmin from "../middlewares/Admin.middlewares.js";
const router = express.Router();

router.get("/get-orders", verifyJWT, adminControllers.getOrders);
router.post("/send-email", verifyAdmin, adminControllers.SendEmailByAdmin);
router.put("/update-status",verifyJWT,adminControllers.updateOrderStatus);
export default router;


