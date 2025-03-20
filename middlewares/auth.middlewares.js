import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"
import dotenv from "dotenv";

dotenv.config({ path: "./.env" }); // Relative path from the root directory

const verifyJWT = async (req, res, next) => {
    try {
        // Retrieve token from cookie or Authorization header
        const token = await req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
     

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Verify Token
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        const user = await User.findById(decodedToken.userId).select("-password");
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: Invalid token." });
        }

        // Attach user to request object
        req.user = user;
        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
    }
};

export default verifyJWT;
