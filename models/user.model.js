import { mongoose } from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        require: false,
    },
    fullName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timeStamps: true })



userSchema.pre('save', async function (next) {
    console.log('pre method', this);
    const user = this;
    if (!user.isModified('password')) {
        next();
    }
})

userSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign({
            userId: this._id.toString(),
            email: this.email,
            isAdmin: this.isAdmin,
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: "2d"
        })
    } catch (error) {
        console.log(`${error}`)
    }
}

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

export const User = new mongoose.model('User', userSchema)