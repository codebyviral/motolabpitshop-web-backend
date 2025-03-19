import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import { productController, getProductById } from "../controllers/product-controllers.js";

const Productrouter = Router();


Productrouter.route("/add").post(upload.fields([{ name: "images", maxCount: 1 }])
    , productController);

Productrouter.post("/get-by-id", getProductById)

export default Productrouter;
