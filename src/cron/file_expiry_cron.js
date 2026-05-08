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

cron.schedule("0 * * * *", async () => {

  console.log("Running file expiry cleanup...");

  const expiredFiles = await File.find({
    status: FILE_STATUS.ACTIVE,
    expiresAt: { $lte: new Date() }
  });

  for (const file of expiredFiles) {

    try {

      if (
        file.provider === FILE_PROVIDERS.CLOUDINARY
      ) {

        await deleteFromCloudinary(file.key);

      } else {

        await deleteFromR2(file.key);
      }

      await File.updateOne(
        { _id: file._id },

        {
          $set: {
            status: FILE_STATUS.EXPIRED,
            url: null
          }
        }
      );

    } catch (error) {

      console.error(
        `Failed to expire file ${file.fileId}`,
        error
      );
    }
  }
});