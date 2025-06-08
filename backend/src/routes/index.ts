import { Router } from "express";
import regRouter from "./auth.routes.js";
import fileRouter from "./file.routes.js";
import chatsRouter from "./chat.routes.js";
import messagesRouter from "./message.routes.js";
const router: Router = Router();

router.use("/user", regRouter);
router.use("/file", fileRouter);
router.use("/chats", chatsRouter);
router.use("/messages", messagesRouter);

export default router;
