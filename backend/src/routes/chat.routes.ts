import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { ChatController } from "../controllers/chatController.js";

const router: Router = Router();

router.get("", authMiddleware, ChatController.getUserChats);

export default router;
