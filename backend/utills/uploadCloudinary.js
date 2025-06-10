import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"  // file system from node.js
import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env variables

  // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SERCET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
		});

		console.log("File is uploaded on cloudinary", response.url);
		return response;
	} catch (error) {
		console.error("Cloudinary Upload Error:", error);  // 🔴 Log the actual error
		fs.unlinkSync(localFilePath);
		return null;
	}
};
export { uploadOnCloudinary };  