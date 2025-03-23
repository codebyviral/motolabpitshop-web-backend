import express from "express";
import multer from "multer"
import { authControllers } from "../controllers/auth-controller.js"
import verifyJWT from "../middlewares/auth.middlewares.js";
import verifyAdmin from "../middlewares/Admin.middlewares.js";
const router = express.Router();

router.post("/signup", authControllers.signup)
router.get("/get-otp",authControllers.sendEmailOtp)
router.post("/verify-account",authControllers.verifyAccount)
router.post("/login",authControllers.login)
router.get("/user",verifyJWT, authControllers.getUser)
router.put("/updateuser", verifyJWT, authControllers.UpdateUser)
router.get("/alluser", authControllers.getAllUser );
router.delete("/deleteuser/:id",authControllers.deleteUser);


export default router;