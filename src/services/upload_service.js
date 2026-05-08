import { v4 as uuidv4 } from "uuid";

import {
  File,
  User,
  UserStorage
} from "../models/index.js";

import {
  getFileType
} from "../utils/file_utils.js";

import { uploadToCloudinary } from "./cloudinary_service.js";
import { uploadToR2 } from "./cloudflare_service.js";

import {
  FILE_PROVIDERS,
  FILE_TYPES,
  FILE_STATUS
} from "../utils/const/enums.js";

export const uploadFileService = async ({
  file,
  userId
}) => {

  if (!file) {
    throw {
      status: 400,
      message: "No file uploaded"
    };
  }

  if (!userId) {
    throw {
      status: 401,
      message: "Unauthorized"
    };
  }

  const fileType = getFileType(file.mimetype);

  let uploadResult;
  let provider;

  // smart routing
  if (
    fileType === FILE_TYPES.IMAGE ||
    fileType === FILE_TYPES.VIDEO
  ) {

    uploadResult = await uploadToCloudinary(
      file.buffer
    );

    provider = FILE_PROVIDERS.CLOUDINARY;

  } else {

    uploadResult = await uploadToR2(file);

    provider = FILE_PROVIDERS.R2;
  }

  const fileId = uuidv4()
    .replace(/-/g, "")
    .slice(0, 12);

  // 8 hours
  const expiresAt = new Date(
    Date.now() + 8 * 60 * 60 * 1000
  );

  // 3 days
  const deleteAt = new Date(
    Date.now() + 3 * 24 * 60 * 60 * 1000
  );

  const savedFile = await File.create({
    fileId,

    originalName: file.originalname,

    fileName:
      uploadResult.public_id ||
      uploadResult.key,

    provider,

    url:
      uploadResult.secure_url ||
      uploadResult.url,

    key:
      uploadResult.public_id ||
      uploadResult.key,

    size: file.size,

    mimeType: file.mimetype,

    fileType,

    userId,

    expiresAt,

    deleteAt,

    status: FILE_STATUS.ACTIVE
  });

  if (savedFile) {

    const category =
      Object.values(FILE_TYPES).includes(fileType)
        ? fileType
        : FILE_TYPES.OTHER;

    const storageDoc =
      await UserStorage.findOneAndUpdate(
        { userId },

        {
          $inc: {
            [`${category}.used`]: file.size,
            [`${category}.count`]: 1,
            totalUsed: file.size
          }
        },

        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

    await User.findOneAndUpdate(
      { userId },

      {
        $inc: {
          monthlyUsage: file.size
        },

        $set: {
          storage: storageDoc._id
        }
      }
    );
  }

  return savedFile;
};