import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import { productController, getProductById , getAllProducts} from "../controllers/product-controllers.js";
import verifyAdmin from "../middlewares/Admin.middlewares.js";

const Productrouter = Router();


Productrouter.route("/add").post(upload.array("images", 5)
    , verifyAdmin, productController);

Productrouter.post("/get-by-id", getProductById)
Productrouter.get("/get-all", getAllProducts);

export default Productrouter;
