import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import { productController } from "../controllers/product-controllers.js";

const Productrouter = Router();


Productrouter.route("/product").post(upload.fields([{ name: "images", maxCount: 1 }])
, productController);

export default Productrouter;
