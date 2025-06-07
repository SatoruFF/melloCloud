import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { MessageController } from "../controllers/messageController.js";

const router: Router = Router();

router.get("", authMiddleware, MessageController.getMessages);

export default router;
