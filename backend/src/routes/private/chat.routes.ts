import { Hono } from "hono";
import { ChatController } from "../../controllers/chatController.js";

const router = new Hono();

router.get("/", (c) => ChatController.getUserChats(c));

export default router;
