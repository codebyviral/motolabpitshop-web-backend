import express from "express";
import {
  addToCart,
  deleteCartItem,
  getUserById,
  getUserCart,
  getAddress,
} from "../controllers/user-controller.js";

const router = express.Router();

router.get("/", getUserById);
router.post("/cart", getUserCart);
router.post("/add-to-cart", addToCart);
router.delete("/delete-cart-item", deleteCartItem);
router.get("/address", getAddress);

export default router;
