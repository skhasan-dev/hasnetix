import express from "express";
import { authRoutes, userRoutes, uploaderRoutes, fileRoutes } from './api_routes/index.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/files", fileRoutes);
router.use("/upload", uploaderRoutes);

export default router;