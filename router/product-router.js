import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import {
  productController,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
  deleteCartItems,
  getCategories,
  addRating,
  updateCartItemQuantity,
} from "../controllers/product-controllers.js";
import verifyAdmin from "../middlewares/Admin.middlewares.js";
import verifyJWT from "../middlewares/auth.middlewares.js";

const Productrouter = Router();

Productrouter.route("/add").post(
  upload.array("images", 5),
  verifyAdmin,
  productController
);

Productrouter.post("/get-by-id", getProductById);
Productrouter.get("/get-all", getAllProducts);
Productrouter.get("/get-categories", getCategories);
Productrouter.put("/cart/:userId/:cartItemId", updateCartItemQuantity);
Productrouter.route("/update-product/:id").put(
  upload.array("images", 5),
  verifyAdmin,
  updateProduct
);
Productrouter.delete("/delete-product/:id", verifyAdmin, deleteProduct);
Productrouter.delete("/delete-cart-items", deleteCartItems);
Productrouter.put("/:id/rate", addRating);
export default Productrouter;
