import {
    getFileByIdServices,
  getUserFilesService
} from "../services/file_services.js";

export const getUserFilesController = async (
  req,
  res,
  next
) => {

  try {

    const userId = req.user?.userId;

    const files =
      await getUserFilesService({
        userId
      });

    res.status(200).json({
      success: true,
      data: files
    });

  } catch (err) {
    next(err);
  }
};

export const getFileByIdController = async (
  req,
  res,
  next
) => {

  try {

    const { id } = req.params;

    const file =
      await getFileByIdServices({
        fileId:id,
      });

    res.status(200).json({
      success: true,
      data: file
    });

  } catch (err) {
    next(err);
  }
};