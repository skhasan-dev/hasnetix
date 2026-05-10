import express from "express";

import {
  getUserFilesController, getFileByIdController, downloadFileController
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

router.get(
  "/download/:id",
  downloadFileController,
);

export default router;