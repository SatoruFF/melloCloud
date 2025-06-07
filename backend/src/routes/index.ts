import { Router } from "express";
import regRouter from "./auth.routes.js";
import fileRouter from "./file.routes.js";
import chatsRouter from "./chat.routes.js";
const router: Router = Router();

router.use("/user", regRouter);
router.use("/file", fileRouter);
router.use("/chat", chatsRouter);

export default router;
