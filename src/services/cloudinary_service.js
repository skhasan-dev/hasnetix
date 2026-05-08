import { default as cloudinary } from "../../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {

  if (!publicId) return false;

  const result =
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType
      }
    );

  return result;
};