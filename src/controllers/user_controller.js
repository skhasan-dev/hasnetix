import { AppError } from "../utils/app_error.js";

import {
  getUserService
} from "../services/user_service.js";

export const getUserController = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const user =
      await getUserService({
        userId: id
      });

    return res.status(200).json({

      status: true,

      message:
        "User fetched successfully",

      data: user
    });

  } catch (error) {

    return res.status(
      error.statusCode || 500
    ).json({

      status: false,

      message:
        error.message ||
        "Internal Server Error",

      stack:
        process.env.NODE_ENV === "development"
          ? error.stack
          : undefined
    });
  }
};