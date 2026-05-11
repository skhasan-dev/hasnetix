import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { User } from "../models/index.js";

import { USER_TYPES } from "../utils/const/enums.js";

import { AppError } from "../utils/app_error.js";

export const authenticateUser = async ({
  email,
  name,
  provider = USER_TYPES.GUEST,
}) => {

  try {

    let user;

    // find existing user
    if (
      provider !== USER_TYPES.GUEST &&
      email
    ) {

      user = await User.findOne({
        email
      });
    }

    // create user if not exists
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

    // generate jwt
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