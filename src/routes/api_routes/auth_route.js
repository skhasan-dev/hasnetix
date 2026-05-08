import express from "express";
import { authenticateController } from "../../controllers/index.js";

const router = express.Router();

router.post('/login', authenticateController);

export default router;