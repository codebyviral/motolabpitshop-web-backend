import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail } from "../services/email.service.js"
import { LoginUser, UserSchema } from "../validation/auth.validation.js";

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

        if (user) {
            res.status(200).json({
                message: 'Login successful',
                token: await userExists.generateAuthToken(),
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

const authControllers = { signup, login }

export { authControllers }