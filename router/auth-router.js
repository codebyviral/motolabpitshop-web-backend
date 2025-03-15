import express from "express";
import multer from "multer"
import { authControllers } from "../controllers/auth-controller.js"

const router = express.Router();

router.post("/signup", authControllers.signup)
router.post("/login",authControllers.login)

export default router;