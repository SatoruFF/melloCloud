import { Router } from "express";
import userRouter from "./user.routes.js";
import fileRouter from "./file.routes.js";
import chatsRouter from "./chat.routes.js";
import messagesRouter from "./message.routes.js";
import taskRouter from "./task.routes.js";
import taskColumn from "./column.routes.js";
import noteRouter from "./note.routes.js";
import { privateMiddlewares } from "../../middleware/base.middleware.js";

const privateRouter: Router = Router();

// basic private middlewares
privateMiddlewares.forEach((m) => privateRouter.use(m));

privateRouter.use("/user", userRouter);
privateRouter.use("/file", fileRouter);
privateRouter.use("/chats", chatsRouter);
privateRouter.use("/messages", messagesRouter);
privateRouter.use("/tasks", taskRouter);
privateRouter.use("/columns", taskColumn);
privateRouter.use("/notes", noteRouter);

export default privateRouter;
