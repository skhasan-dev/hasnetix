import { authenticateUser } from "../services/auth_service.js";
import { USER_TYPES } from "../utils/const/enums.js";

export const authenticateController = async (req, res, next) => {
  try {
    const { email, name, provider } = req.body;

    // fallback to guest if not provided
    const userType = provider || USER_TYPES.GUEST;

    const { user, token } = await authenticateUser({
      email,
      name,
      provider: userType,
    });

    res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      data: {
        user,
        token,
      },
    });

  } catch (err) {
    next(err);
  }
};