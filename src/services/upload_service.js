import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

import { getActivePairingService, getPairedDeviceTokensService } from './pairing_service.js';
import { sendSilentPushToMany } from './fcm_service.js';

dotenv.config();

import {
  File,
  User,
  UserStorage
} from "../models/index.js";

import {
  getFileType, getDeleteTime, getExpiryTime
} from "../utils/file_utils.js";

import {
  uploadToCloudinary
} from "./cloudinary_service.js";

import {
  uploadToR2
} from "./cloudflare_service.js";

import {
  FILE_PROVIDERS,
  FILE_TYPES,
  FILE_STATUS
} from "../utils/const/enums.js";

import {
  AppError
} from "../utils/app_error.js";

export const uploadFileService = async ({file, userId, senderDeviceId, targetDeviceIds = null}) => {

  try {

    if (!file) {
      throw new AppError(
        400,
        "No file uploaded"
      );
    }

    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const fileType =
      getFileType(file.mimetype);

    let uploadResult;

    let provider;

    // smart routing
    if (
      fileType === FILE_TYPES.IMAGE ||
      fileType === FILE_TYPES.VIDEO
    ) {

      uploadResult =
        await uploadToCloudinary(
          file.buffer
        );

      provider =
        FILE_PROVIDERS.CLOUDINARY;

    } else {

      uploadResult =
        await uploadToR2(file);

      provider =
        FILE_PROVIDERS.R2;
    }

    const fileId = uuidv4()
      .replace(/-/g, "")
      .slice(0, 12);

    const expiresAt = getExpiryTime();

    const deleteAt = getDeleteTime();

    const savedFile =
      await File.create({

        fileId,

        originalName:
          file.originalname,

        fileName:
          uploadResult.public_id ||
          uploadResult.key,

        provider,

        url:
          uploadResult.secure_url ||
          uploadResult.url,

        downloadUrl:
          process.env.API_BASE_URL +
          "files/download/" +
          fileId,

        key:
          uploadResult.public_id ||
          uploadResult.key,

        size: file.size,

        mimeType:
          file.mimetype,

        fileType,

        userId,

        expiresAt,

        deleteAt,

        status:
          FILE_STATUS.ACTIVE
      });

    if (savedFile) {

      notifyPairedDevices({file:savedFile, senderDeviceId, targetDeviceIds});

      const category =
        fileType || FILE_TYPES.OTHER;

      const storageDoc =
        await UserStorage.findOneAndUpdate(

          { userId },

          {
            $inc: {
              [`${category}.used`]:
                file.size,

              [`${category}.count`]:
                1,

              totalUsed:
                file.size
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
            monthlyUsage:
              file.size
          },

          $set: {
            storage:
              storageDoc._id
          }
        }
      );
    }

    return savedFile;

  } catch (error) {

    throw new AppError(
      error.statusCode || 500,

      error.message ||
      "Failed to upload file",

      error.stack
    );
  }
};

export async function notifyPairedDevices({ file, senderDeviceId, targetDeviceIds = null }) {
  if (!senderDeviceId) return;

  let tokens;

  if (targetDeviceIds?.length) {
    // Resolve specific deviceIds → fcmTokens
    const pairing = await getActivePairingService(senderDeviceId);
    if (!pairing) return;

    const allDevices = [pairing.initiator, ...pairing.receivers];
    tokens = targetDeviceIds
      .map((id) => allDevices.find((d) => d.deviceId === id)?.fcmToken)
      .filter(Boolean);
  } else {
    // Default: notify all paired devices
    tokens = await getPairedDeviceTokensService(senderDeviceId);
  }

  if (!tokens.length) return;

  await sendSilentPushToMany({
    fcmTokens: tokens,
    data: {
      type: 'FILE_READY',
      fileId: file._id.toString(),
      fileName: file.name ?? file.originalName ?? 'file',
      fileSize: String(file.size ?? 0),
      fileType: file.mimeType ?? '',
    },
  });
}