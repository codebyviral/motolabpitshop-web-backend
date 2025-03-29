import { Router } from "express";
import { upload } from "../middlewares/multer.middlerwares.js";
import { productController, getProductById , getAllProducts, updateProduct, deleteProduct} from "../controllers/product-controllers.js";
import verifyAdmin from "../middlewares/Admin.middlewares.js";

const Productrouter = Router();


Productrouter.route("/add").post(upload.array("images", 5)
    , verifyAdmin, productController);

Productrouter.post("/get-by-id", getProductById)
Productrouter.get("/get-all", getAllProducts);
Productrouter.route("/update-product/:id").put(upload.array("images", 5) , verifyAdmin, updateProduct);
Productrouter.delete("/delete-product/:id",verifyAdmin,deleteProduct);
export default Productrouter;
