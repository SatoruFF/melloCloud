import { Router } from "express";
import userRouter from "./user.routes.js";
import fileRouter from "./file.routes.js";
import chatsRouter from "./chat.routes.js";
import messagesRouter from "./message.routes.js";
import taskRouter from "./task.routes.js";
import taskColumn from "./column.routes.js";

const router: Router = Router();

router.use("/user", userRouter);
router.use("/file", fileRouter);
router.use("/chats", chatsRouter);
router.use("/messages", messagesRouter);
router.use("/tasks", taskRouter);
router.use("/columns", taskColumn);

export default router;
