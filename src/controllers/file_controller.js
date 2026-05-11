import {
  getFileByIdService,
  getUserFilesService,
  downloadFileService,
  deleteFileByIdService,
  deleteUserFilesService
} from "../services/file_services.js";

export const getUserFilesController = async (
  req,
  res
) => {

  try {

    const userId =
      req.user?.userId;

    const files =
      await getUserFilesService({
        userId
      });

    return res.status(200).json({

      status: true,

      message:
        "Files fetched successfully",

      data: files
    });

  } catch (error) {

    return res.status(
      error.statusCode || 500
    ).json({

      status: false,

      message:
        error.message ||
        "Failed to fetch files",

      // stack:
      //   process.env.NODE_ENV === "development"
      //     ? error.stack
      //     : undefined
    });
  }
};

export const getFileByIdController = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;

    const file =
      await getFileByIdService({
        fileId: id,
      });

    return res.status(200).json({

      status: true,

      message:
        "File fetched successfully",

      data: file
    });

  } catch (error) {

    return res.status(
      error.statusCode || 500
    ).json({

      status: false,

      message:
        error.message ||
        "Failed to fetch file",

      // stack:
      //   process.env.NODE_ENV === "development"
      //     ? error.stack
      //     : undefined
    });
  }
};

export const downloadFileController = async (
  req,
  res
) => {

  try {

    const result =
      await downloadFileService({
        fileId: req.params.id
      });

    // cloudinary redirect
    if (result.type === "redirect") {

      return res.redirect(
        result.url
      );
    }

    // other providers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`
    );

    return res.redirect(
      result.url
    );

  } catch (error) {

    return res.status(
      error.statusCode || 500
    ).json({

      status: false,

      message:
        error.message ||
        "Failed to download file",

      // stack:
      //   process.env.NODE_ENV === "development"
      //     ? error.stack
      //     : undefined
    });
  }
};

export const deleteFileByIdController = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;

    await deleteFileByIdService({
      fileId: id
    });

    return res.status(200).json({

      status: true,

      message:
        "File deleted successfully",

      // data: null
    });

  } catch (error) {

    return res.status(
      error.statusCode || 500
    ).json({

      status: false,

      message:
        error.message ||
        "Failed to delete file",

      // stack:
      //   process.env.NODE_ENV === "development"
      //     ? error.stack
      //     : undefined
    });
  }
};

export const deleteUserFilesController = async (
  req,
  res
) => {

  try {

    const userId =
      req.user?.userId;

    await deleteUserFilesService({
      userId
    });

    return res.status(200).json({

      status: true,

      message:
        "All files deleted successfully",

      // data: null
    });

  } catch (error) {

    return res.status(
      error.statusCode || 500
    ).json({

      status: false,

      message:
        error.message ||
        "Failed to delete files",

      // stack:
      //   process.env.NODE_ENV === "development"
      //     ? error.stack
      //     : undefined
    });
  }
};