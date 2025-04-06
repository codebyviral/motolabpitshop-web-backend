import express from "express";
import { authControllers } from "../controllers/auth-controller.js"
import verifyJWT from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/signup", authControllers.signup)
router.get("/get-otp",authControllers.sendEmailOtp)
// Change in the router
router.post("/otp-for-password", authControllers.passwordOtp)
router.post("/verify-account",authControllers.verifyAccount)
router.post("/verify-email",authControllers.verifyEmail)
router.post("/login",authControllers.login)
router.get("/user",verifyJWT, authControllers.getUser)
router.put("/updateuser", verifyJWT, authControllers.UpdateUser)
router.get("/alluser", authControllers.getAllUser );
router.delete("/deleteuser/:id",authControllers.deleteUser);
router.post("/reset-password", authControllers.resetPassword);

export default router;