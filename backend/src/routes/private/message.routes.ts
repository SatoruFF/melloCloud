import { Router } from "express";
import { MessageController } from "../../controllers/messageController";

const router: Router = Router();

router.get("", MessageController.getMessages);

export default router;
