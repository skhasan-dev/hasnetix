import { FILE_TYPES } from "./const/enums.js";

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

export const getExpiryDate = (hours = 8) => {
  return new Date(
    Date.now() + hours * 60 * 60 * 1000
  );
};