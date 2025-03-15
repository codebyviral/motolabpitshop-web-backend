import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongo_uri = process.env.MONGODB_URI;

const connectToDataBase = async () => {
    try {
        await mongoose.connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log(`Motolab has connected to MongoDB Successfully 🎉`)
    } catch (err) {
        console.log(`Database connection error: ${err}`);
        process.exit(0);
    }
}

export { connectToDataBase }