import express from "express";
import { addToCart, deleteCartItem, getUserById, getUserCart } from "../controllers/user-controller.js";

const router = express.Router();

router.get("/",getUserById)
router.post("/cart",getUserCart)
router.post("/add-to-cart",addToCart)
router.delete("/delete-cart-item",deleteCartItem)

export default router;