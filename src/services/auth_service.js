import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import {
  User,
  Device,
} from "../models/index.js";

import {
  USER_TYPES
} from "../utils/const/enums.js";

import { AppError } from "../utils/app_error.js";

export const authenticateUser = async ({
  email,
  name,
  provider = USER_TYPES.GUEST,

  deviceId,
  deviceName,
  deviceType,
  fcmToken,
}) => {

  try {

    let user;

    if (
      provider !== USER_TYPES.GUEST &&
      email
    ) {

      user = await User.findOne({
        email
      });
    }

    if (!user) {

      const userId = uuidv4();

      const now = new Date();

      const nextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );

      user = await User.create({
        userId,

        type: provider,

        email: email || undefined,

        name,

        usageResetAt: nextMonth,

        monthlyUsage: 0,
      });
    }

    let device = await Device.findOne({
      deviceId
    });

    if (!device) {

      device = await Device.create({
        userId: user._id,

        deviceId,

        deviceName,

        deviceType,

        fcmToken,
      });

    } else {

      device.userId = user._id;

      device.deviceName = deviceName;

      device.deviceType = deviceType;

      device.fcmToken = fcmToken;

      await device.save();
    }
    
    user.device = device._id;

    // const alreadyPaired =
    //   user.pairedDevices?.some(
    //     (id) => id.toString() === device._id.toString()
    //   );

    // if (!alreadyPaired) {

    //   user.pairedDevices.push(device._id);
    // }

    await user.save();

    const token = jwt.sign(
      {
        userId: user.userId,

        type: user.type,
      },

      process.env.SECRET,

      {
        expiresIn: "30d"
      }
    );

    return {
      user,

      token,
    };

  } catch (error) {

    throw new AppError(
      error.statusCode || 500,

      error.message || "Authentication failed",

      error.stack
    );
  }
};