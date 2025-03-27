import {z} from "zod";

export const UserSchema = z.object({
    fullName : z.string()
        .trim()
        .min(3, { message: "name must be at least 3 characters long" })
        .max(20, { message: "name ust be no longer than 20 word" }),


    password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),


    email: z.string()
        .email(),

    isAdmin : z.boolean()
})

export const LoginUser = z.object({
    email: z.string()
        .email({ message: "Invalid email format" }),
       
    password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),
})

export const ProductSchema = z.object({
    title: z.string().trim(),
    description: z.string().trim(),
    price: z.preprocess((val) => Number(val), z.number()),  // Convert to number
    category: z.string().trim(),
})

export const updateSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, { message: "Name should be at least 2 characters long" })
        .max(50, { message: "Name should be less than 50 characters" }),

    email: z.string().trim().email({ message: "Invalid email format" }),
})