import {
  getFileByIdServices,
  getUserFilesService,
  downloadFileService,
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
        fileId: id,
      });

    res.status(200).json({
      success: true,
      data: file
    });

  } catch (err) {
    next(err);
  }
};

export const downloadFileController = async (
  req,
  res,
  next
) => {

  try {

    const result =
      await downloadFileService({
        fileId: req.params.fileId
      });

    // cloudinary
    if (result.type === "redirect") {
      return res.redirect(result.url);
    }

    // other providers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`
    );

    return res.redirect(result.url);

  } catch (error) {
    next(error);
  }
};