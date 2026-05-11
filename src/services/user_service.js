import { User } from "../models/index.js";

export const getUserService = async ({ userId }) => {
  if (!userId) {
    throw new AppError(
      401,
      "Unauthorized"
    );
  }

  const user = await User.findOne({ userId }).populate("storage");;

  if (!user) {
    throw new AppError(
      404,
      "User not Found"
    );
  }

  return user;
};