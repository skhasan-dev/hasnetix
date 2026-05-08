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