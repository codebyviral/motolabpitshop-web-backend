import express from "express";
import multer from "multer"
import { authControllers } from "../controllers/auth-controller.js"
import verifyJWT from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/signup", authControllers.signup)
router.post("/login",authControllers.login)
router.get("/user",verifyJWT, authControllers.getUser)
router.put("/updateuser", verifyJWT, authControllers.UpdateUser)


export default router;