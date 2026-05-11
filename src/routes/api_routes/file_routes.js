import express from "express";

import {
  getUserFilesController, getFileByIdController, downloadFileController, deleteUserFilesController, deleteFileByIdController,
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

router.delete(
  "/",
  ensureAuthenticated,
  deleteUserFilesController
);

router.get(
  "/:id",
  ensureAuthenticated,
  getFileByIdController
);

router.delete(
  "/:id",
  ensureAuthenticated,
  deleteFileByIdController
);

router.get(
  "/download/:id",
  downloadFileController,
);

export default router;