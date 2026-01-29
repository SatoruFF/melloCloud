import { Hono } from "hono";
import { MessageController } from "../../controllers/messageController.js";

const router = new Hono();

router.get("/", (c) => MessageController.getMessages(c));

export default router;
