import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { USER_TYPES } from "../utils/const/enums.js";
import { v4 as uuidv4 } from "uuid";

export const authenticateUser = async ({
  email,
  name,
  provider = USER_TYPES.GUEST,
}) => {
  let user;

  // 🔹 1. Try to find existing user (only for non-guest)
  if (provider !== USER_TYPES.GUEST && email) {
    user = await User.findOne({ email });
  }

  // 🔹 2. If not found → create user
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

  // 🔹 3. Generate JWT
  const token = jwt.sign(
    {
      userId: user.userId,
      type: user.type,
    },
    process.env.SECRET,
    { expiresIn: "30d" }
  );

  return {
    user,
    token,
  };
};