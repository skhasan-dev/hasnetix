import { uploadFileService } from "../services/upload_service.js";
import dotenv from 'dotenv';

dotenv.config();

export const uploadFileController = async (
  req,
  res,
  next
) => {

  try {

    const file = req.file;

    const userId = req.user?.userId;

    const uploadedFile =
      await uploadFileService({
        file,
        userId
      });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",

      data: {
        fileId: uploadedFile.fileId,
        originalName: uploadedFile.originalName,
        fileType: uploadedFile.fileType,
        size: uploadedFile.size,
        downloadUrl: process.env.API_BASE_URL+'files/download/'+uploadedFile.fileId, ///uploadedFile.downloadUrl
        expiresAt: uploadedFile.expiresAt,
        createdAt: uploadedFile.createdAt
      }
    });

  } catch (err) {
    return res.status(
      error.statusCode || 500
    ).json({

      status: false,

      message:
        error.message ||
        "Internal Server Error",

      // stack:
      //   process.env.NODE_ENV === "development"
      //     ? error.stack
      //     : undefined
    });
  }
};