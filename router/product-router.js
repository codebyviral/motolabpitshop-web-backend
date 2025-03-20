import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import { productController, getProductById , getAllProducts} from "../controllers/product-controllers.js";

const Productrouter = Router();


Productrouter.route("/add").post(upload.fields([{ name: "images", maxCount: 1 }])
    , productController);

Productrouter.post("/get-by-id", getProductById)
Productrouter.get("/get-all", getAllProducts);

export default Productrouter;
