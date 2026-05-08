import { getUserService } from "../services/user_service.js";

export const getUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getUserService({ userId : id });

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (err) {
    next(err);
  }
};