import express from "express";
import { getUserById } from "../controllers/user-controller.js";

const router = express.Router();

router.get("/",getUserById)

export default router;