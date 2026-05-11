import { FILE_TYPES, FILE_PROVIDERS } from "./const/enums.js";
import { generateR2DownloadUrl } from "../services/cloudflare_service.js";

export const getFileType = (mimeType) => {
  if (mimeType.startsWith("image/")) {
    return FILE_TYPES.IMAGE;
  }

  if (mimeType.startsWith("video/")) {
    return FILE_TYPES.VIDEO;
  }

  if (mimeType === "application/pdf") {
    return FILE_TYPES.DOCUMENT;
  }

  return FILE_TYPES.OTHER;
};

const IS_STAGE =
  process.env.FLAVOR === "stage";

export const getExpiryTime = (
  hours = 8
) => {

  // stage -> 5 mins
  if (IS_STAGE) {

    return new Date(
      Date.now() + 5 * 60 * 1000
    );
  }

  // prod
  return new Date(
    Date.now() +
    hours * 60 * 60 * 1000
  );
};

export const getDeleteTime = (
  hours = 72
) => {

  // stage -> 15 mins
  if (IS_STAGE) {

    return new Date(
      Date.now() + 15 * 60 * 1000
    );
  }

  // prod
  return new Date(
    Date.now() +
    hours * 60 * 60 * 1000
  );
};

export const generateDownloadUrl = async (file) => {

  if(!file) throw {'error': 'File Not Found'}

  if (file.provider === FILE_PROVIDERS.CLOUDINARY) {

    const downloadUrl =
      file.url.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );

    return {
      type: "redirect",
      url: downloadUrl
    };
  }

  if (file.provider === FILE_PROVIDERS.R2) {
    const downloadUrl =
      await generateR2DownloadUrl(
        file.key,
        file.originalName
      );

    return {
      type: "redirect",
      url: downloadUrl,
      fileName: file.originalName
    };
  }
}