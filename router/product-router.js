import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import { productController, getProductById } from "../controllers/product-controllers.js";

const Productrouter = Router();


Productrouter.route("/add").post(upload.array("images", 5)
    , productController);

Productrouter.post("/get-by-id", getProductById)

export default Productrouter;
