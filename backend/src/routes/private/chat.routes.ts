import { Hono } from "hono";
import { ChatController } from "../../controllers/chatController.js";

const router = new Hono();

router.get("/", (c) => ChatController.getUserChats(c));
router.post("/group", (c) => ChatController.createGroupChat(c));

export default router;
