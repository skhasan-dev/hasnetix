import { User } from "../models/index.js";

export const getUserService = async ({ userId }) => {
  if (!userId) {
    throw {
      status: 400,
      message: "User ID is required",
    };
  }

  const user = await User.findOne({ userId }).populate("storage");;

  if (!user) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  return user;
};