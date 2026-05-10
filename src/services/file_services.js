import { File } from "../models/index.js";

export const getUserFilesService = async ({
  userId
}) => {

  if (!userId) {
    throw {
      status: 401,
      message: "Unauthorized"
    };
  }

  const files = await File.find({
    userId
  })
    .sort({ createdAt: -1 })
    .select(
      `
      fileId
      userId
      originalName
      url
      fileType
      size
      status
      expiresAt
      createdAt
      `
    );

  return files;
};

export const getFileByIdServices = async ({
  fileId
}) => {

  if (!fileId) {
    throw {
      status: 404,
      message: "File Not Found"
    };
  }

  const file = await File.findOne({
    fileId
  }).select(
      `
      fileId
      userId
      originalName
      url
      fileType
      size
      status
      expiresAt
      createdAt
      `
    );

  return file;
};

export const downloadFileService = async ({
  fileId
}) => {

  if (!fileId) {
    throw {
      status: 400,
      message: "File ID is required"
    };
  }

  const file = await File.findOne({
    fileId
  });

  if (!file) {
    throw {
      status: 404,
      message: "File not found"
    };
  }

  if (file.status !== FILE_STATUS.ACTIVE) {
    throw {
      status: 410,
      message: "Link expired"
    };
  }

  // increment download count
  file.downloadCount += 1;

  await file.save();

  // cloudinary direct download
  if (
    file.provider === FILE_PROVIDERS.CLOUDINARY
  ) {

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

  // default providers (R2/S3/etc)
  return {
    type: "attachment",

    url: file.url,

    fileName: file.originalName
  };
};