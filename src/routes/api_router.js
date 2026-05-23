import express from "express";
import { authRoutes, userRoutes, uploaderRoutes, fileRoutes, pairingRoutes, notificationRoutes } from './api_routes/index.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/files", fileRoutes);
router.use("/upload", uploaderRoutes);
router.use("/pairing", pairingRoutes);
router.use("/notifications", notificationRoutes);

export default router;