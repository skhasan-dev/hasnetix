import { authenticateUser } from "../services/auth_service.js";

import {
  USER_TYPES
} from "../utils/const/enums.js";

export const authenticateController = async (
  req,
  res,
  next
) => {

  try {

    const {
      userId,
      email,
      name,
      provider,

      deviceId,
      deviceName,
      deviceType,
      fcmToken,
    } = req.body;

    const userType =
      provider || USER_TYPES.GUEST;

    if (
      !deviceId ||
      !deviceName ||
      !deviceType ||
      !fcmToken
    ) {

      return res.status(400).json({
        success: false,

        message:
          "deviceId, deviceName, deviceType and fcmToken are required",
      });
    }

    const {
      user,
      token
    } = await authenticateUser({
      userId,
      email,
      name,

      provider: userType,

      deviceId,
      deviceName,
      deviceType,
      fcmToken,
    });

    return res.status(200).json({
      success: true,

      message:
        "Authenticated successfully",

      data: {
        user,
        token,
      },
    });

  } catch (error) {

    return res.status(
      error.statusCode || 500
    ).json({

      success: false,

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