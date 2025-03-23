import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail } from "../services/email.service.js"
import { LoginUser, updateSchema, UserSchema } from "../validation/auth.validation.js";

const signup = async (req, res) => {
    try {
        const { data, error } = UserSchema.safeParse(req.body)
        if (error) {
            return res.json({
                message: error.errors[0].message
            })
        }
        const { fullName, email, password } = data;
        const userExists = await User.findOne({ email })
        if (userExists) return res.status(400).json({
            msg: "Email Already Exists"
        })
        const hashed_password = await bcrypt.hash(password, 10)
        const newUser = await new User({
            fullName,
            email,
            password: hashed_password,
            isAdmin: "false"
        })
        await newUser.save();
        await sendWelcomeEmail(fullName, email, "Welcome to MotoLab PitShop!");
        return res.status(200).json({ msg: "Success" })
    } catch (error) {
        console.log(`Error during signup from controller: ${error}`)
    }
}

const login = async (req, res) => {
    try {
        const { data, error } = LoginUser.safeParse(req.body)
        if (error) {
            return res.json({
                message: error.errors[0].message
            })
        }

        const { email, password } = data;
        console.log(data);
        const userExists = await User.findOne({ email })
        if (!userExists) {
            // Never let anyone know what is wrong where. eg. hackers
            return res.status(400).json({ msg: 'Invalid Credentials' })
        }
        const user = await userExists.comparePassword(password)
        const token = await userExists.generateAuthToken();
        console.log(token)
        const option ={
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            secure: false,  // Set to true if using HTTPS
        }
        if (user) {
            res.status(200).cookie("authToken",token, option).json({
                message: 'Login successful',
                token,
                userId: await userExists._id.toString(),
                isAdmin: await userExists.isAdmin,
                imageUrl: await userExists.avatar,
            })
        } else {
            res.status(401).json({ message: 'Invalid email or password.' })
        }
    } catch (error) {
        res.status(500).send('Internal Server Error')
        console.log('login controller error', error)
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("fullName email");
        console.log(user);
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        return res.status(200).json({ message: "User found", user });

    } catch (error) {
        console.error("Error in getUser:", error);
        return res.status(500).json({ msg: "Internal server error", error });
    }
};


export const UpdateUser = async(req,res)=>{
    const {data,error} = updateSchema.safeParse(req.body);
    if(error){
        return res.status(400).json({msg : error.errors[0].message})
    }
    const {fullName , email} = data;
    if(!fullName || !email){
        return res.status(400).json({msg : "Please provide full name and email"})
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{fullName , email}
    },
{
    new : true,
})
    res.status(200).json({messege : "user detail updated successfully" , user} )
}

const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select("fullName email");
        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json({ message: "Users found", users });
    } catch (error) {
        console.error("Error in getAllUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const deleteUser = async(req,res) =>{
    try{
        const {id} = req.params;
        console.log("User ID to delete:", id);

        const user  = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json({messege : "User not found"})
        }
        res.status(200).json({messege : "User deleted successfully" , user});dddd
    }
    catch(error){
        console.log(error)
    }
}

const authControllers = { signup, login, getUser, UpdateUser ,getAllUser , deleteUser }

export { authControllers }