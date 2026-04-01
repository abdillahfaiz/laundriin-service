import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

/**
 * Upload buffer to Cloudinary
 * @param buffer - File buffer from multer
 * @param folder - Cloudinary folder path
 * @returns Cloudinary secure_url
 */
export const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};
