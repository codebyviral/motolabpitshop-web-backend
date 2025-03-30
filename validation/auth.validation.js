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

})

export const LoginUser = z.object({
    email: z.string()
        .email({ message: "Invalid email format" }),
       
    password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),
})



export const ProductSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be positive").min(0.01, "Price is required"),
    size: z.string().min(1, "Size is required"),
    category: z.string().min(1, "Category is required"),
    quantity: z.coerce.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
});


export const updateSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, { message: "Name should be at least 2 characters long" })
        .max(50, { message: "Name should be less than 50 characters" }),

    email: z.string().trim().email({ message: "Invalid email format" }),
})