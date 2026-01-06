import { Router } from "express";
import { MessageController } from "../../controllers/messageController.js";

const router: Router = Router();

router.get("", MessageController.getMessages);

export default router;
