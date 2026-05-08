import express from "express";
import { getUserController } from "../../controllers/index.js";

const router = express.Router();

router.get('/:id', getUserController);

export default router;