import cron from "node-cron";

import { File } from "../models/index.js";

import {
  FILE_STATUS,
  FILE_PROVIDERS
} from "../utils/const/enums.js";

import {
  deleteFromCloudinary
} from "../services/cloudinary_service.js";

import {
  deleteFromR2
} from "../services/cloudflare_service.js";

cron.schedule("*/10 * * * *", async () => {

  console.log(
    "Running file cleanup..."
  );

  const now = new Date();

  // expire files
  try {

    const expiredResult =
      await File.updateMany(

        {
          status:
            FILE_STATUS.ACTIVE,

          expiresAt: {
            $lte: now
          }
        },

        {
          $set: {
            status:
              FILE_STATUS.EXPIRED
          }
        }
      );

    console.log(
      `Expired ${expiredResult.modifiedCount} files`
    );

  } catch (error) {

    console.error(
      "Failed to expire files",
      error
    );
  }

  // permanently delete files
  try {

    const filesToDelete =
      await File.find({

        deleteAt: {
          $lte: now
        }
      });

    for (const file of filesToDelete) {

      try {

        if (
          file.provider ===
          FILE_PROVIDERS.CLOUDINARY
        ) {

          await deleteFromCloudinary(
            file.key
          );

        } else if (
          file.provider ===
          FILE_PROVIDERS.R2
        ) {

          await deleteFromR2(
            file.key
          );
        }

        await File.deleteOne({
          _id: file._id
        });

        console.log(
          `Deleted file ${file.fileId}`
        );

      } catch (error) {

        console.error(
          `Failed to delete file ${file.fileId}`,
          error
        );
      }
    }

  } catch (error) {

    console.error(
      "Failed to fetch delete files",
      error
    );
  }
});