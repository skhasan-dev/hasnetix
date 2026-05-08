import express from "express";

import { uploader } from "../../../config/multer.js";

import { default as ensureAuthenticated } from "../../middlewares/validate-token-middleware.js";

import {
  uploadFileController
} from "../../controllers/upload_controller.js";

const router = express.Router();

router.post(
  "/",

  ensureAuthenticated,

  uploader.single("file"),

  uploadFileController
);

export default router;