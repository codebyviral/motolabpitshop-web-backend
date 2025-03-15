import {z} from "zod";

export const UserSchema = z.object({
    fullname : z.string()
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
       .email(),
       
    password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),
})

export const ProductSchema = z.object({
    title: z.string().trim(),
    description: z.string().trim(),
    price: z.preprocess((val) => Number(val), z.number()),  // Convert to number
    rating: z.preprocess((val) => Number(val), z.number()), // Convert to number
    category: z.string().trim(),
    size: z.string().trim(),
})