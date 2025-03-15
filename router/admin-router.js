import express from "express";
import multer from "multer"
import { adminControllers } from "../controllers/admin-controller.js"

const router = express.Router();

router.route("/login", adminControllers.login)

export default router;