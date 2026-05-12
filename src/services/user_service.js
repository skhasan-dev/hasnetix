import { User } from "../models/index.js";
import { AppError } from "../utils/app_error.js";

export const getUserService = async ({ userId }) => {
  if (!userId) {
    throw new AppError(
      400,
      "User ID is required"
    );
  }

  const user = await User.findOne({ userId }).populate("storage");

  if (!user) {
    throw new AppError(
      404,
      "User not Found"
    );
  }

  return user;
};