import { Router } from "express";
import { publicMiddlewares } from "../../middleware/base.middleware.js";
import userRouter from "./user-public.routes.js";

const publicRouter = Router();

publicMiddlewares.forEach((m) => publicRouter.use(m));

publicRouter.use("/user", userRouter);

export default publicRouter;
