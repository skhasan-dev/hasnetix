import { File } from "../models/index.js";
import { FILE_STATUS, FILE_PROVIDERS } from "../utils/const/enums.js";
import { generateDownloadUrl } from "../utils/file_utils.js";
import { AppError } from "../utils/app_error.js";
import { deleteFromCloudinary } from "./cloudinary_service.js";
import { deleteFromR2 } from "./cloudflare_service.js";

export const getUserFilesService = async ({
  userId,
  type,
  query,
  page = 1,
  limit = 10,
}) => {
  try {
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const filter = {
      userId,
    };

    // filter by file type
    if (type) {
      filter.fileType = type;
    }

    // search by original file name
    if (query) {
      filter.originalName = {
        $regex: query,
        $options: "i",
      };
    }

    const files = await File.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select(`
        fileId
        userId
        originalName
        downloadUrl
        fileType
        size
        status
        expiresAt
        createdAt
      `);

    const total = await File.countDocuments(filter);

    return {
      files,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      error.statusCode || 500,
      error.message || "Failed to fetch user files",
      error.stack
    );
  }
};

export const getFileByIdService = async ({
  fileId,
  userId
}) => {

  try {

    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (!fileId) {
      throw new AppError(
        404,
        "File Not Found"
      );
    }

    const file = await File.findOne({
      fileId,
      userId
    }).select(
      `
      fileId
      userId
      originalName
      downloadUrl
      fileType
      size
      status
      expiresAt
      createdAt
      `
    );

    if (!file) {
      throw new AppError(
        404,
        "File Not Found"
      );
    }

    return file;

  } catch (error) {

    throw new AppError(
      error.statusCode || 500,
      error.message || "Failed to fetch file",
      error.stack
    );
  }
};

export const deleteFileByIdService = async ({
  fileId,
  userId
}) => {

  try {

    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (!fileId) {
      throw new AppError(
        404,
        "File Not Found"
      );
    }

    const file = await File.findOne({
      fileId,
      userId
    });

    if (!file) {
      throw new AppError(
        404,
        "File Not Found"
      );
    }

    // delete from storage
    if (file.provider === FILE_PROVIDERS.CLOUDINARY) {

      await deleteFromCloudinary(
        file.key,
        "auto"
      );

    } else if (file.provider === FILE_PROVIDERS.R2) {

      await deleteFromR2(
        file.key
      );
    }

    // delete from db
    await File.deleteOne({
      fileId,
      userId
    });

    return true;

  } catch (error) {

    throw new AppError(
      error.statusCode || 500,
      error.message || "Failed to delete file",
      error.stack
    );
  }
};

export const deleteUserFilesService = async ({
  userId
}) => {

  try {

    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const files = await File.find({
      userId
    });

    for (const file of files) {

      if (file.provider === FILE_PROVIDERS.CLOUDINARY) {

        await deleteFromCloudinary(
          file.key,
          "auto"
        );

      } else if (file.provider === FILE_PROVIDERS.R2) {

        await deleteFromR2(
          file.key
        );
      }
    }

    await File.deleteMany({
      userId
    });

    return true;

  } catch (error) {

    throw new AppError(
      error.statusCode || 500,
      error.message || "Failed to delete user files",
      error.stack
    );
  }
};

export const downloadFileService = async ({
  fileId,
  userId
}) => {

  try {

    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (!fileId) {
      throw new AppError(
        400,
        "File ID is required"
      );
    }

    const file = await File.findOne({
      fileId,
      userId
    });

    if (!file) {
      throw new AppError(
        404,
        "File not found"
      );
    }

    if (file.status !== FILE_STATUS.ACTIVE) {
      throw new AppError(
        410,
        "Link expired"
      );
    }

    // increment download count
    file.downloadCount += 1;

    await file.save();

    const { url, type } =
      await generateDownloadUrl(file);

    return {
      type,

      url,

      fileName: file.originalName
    };

  } catch (error) {

    throw new AppError(
      error.statusCode || 500,
      error.message || "Failed to download file",
      error.stack
    );
  }
};