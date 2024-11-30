import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
 export const uploadFileToCloudinary = async (inputBuffer, folderName) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName, resource_type: "auto" },
        (error, result) => {
          if (error) {
            return reject(new Error("Failed to upload file to Cloudinary: " + error.message));
          }
          resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(inputBuffer).pipe(uploadStream);
    });
  };