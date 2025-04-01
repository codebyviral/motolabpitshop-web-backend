import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config({
    path: ".env"
})


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINERY_API_KEY,
    api_secret: process.env.CLOUDINERY_API_SECRET 
});

const uploadCloudinery = async (localpath) => {
    try {
        if (!localpath) {
            return null;
        }
        const responce = await cloudinary.uploader.upload(localpath, { resource_type: "auto" });
        // fs.unlinkSync(localpath);
        return responce;
    } catch (error) {
        console.error("Cloudinary Upload Error", error);
        // fs.unlinkSync(localpath);
        return null;
    }
}

export { uploadCloudinery }