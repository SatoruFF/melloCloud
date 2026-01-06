import { Router } from "express";
import { ChatController } from "../../controllers/chatController.js";

const router: Router = Router();

router.get("", ChatController.getUserChats);

export default router;
