import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import { productController } from "../controllers/product-controllers.js";

const Productrouter = Router();

// Fix Multer: Use `upload.fields()`
Productrouter.route("/product").post(upload.array("images", 5), productController);

export default Productrouter;
