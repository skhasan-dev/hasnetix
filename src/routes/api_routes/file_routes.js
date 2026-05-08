import express from "express";

import {
  getUserFilesController, getFileByIdController
} from "../../controllers/file_controller.js";

import {
  default as ensureAuthenticated
} from "../../middlewares/validate-token-middleware.js";

const router = express.Router();

router.get(
  "/",
  ensureAuthenticated,
  getUserFilesController
);

router.get(
  "/:id",
  ensureAuthenticated,
  getFileByIdController
);

export default router;