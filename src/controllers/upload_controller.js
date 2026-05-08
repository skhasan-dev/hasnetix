import { uploadFileService } from "../services/upload_service.js";

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
        url: uploadedFile.url,
        expiresAt: uploadedFile.expiresAt,
        createdAt: uploadedFile.createdAt
      }
    });

  } catch (err) {
    next(err);
  }
};