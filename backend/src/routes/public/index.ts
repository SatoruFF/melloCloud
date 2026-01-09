import { Router } from "express";
import { publicMiddlewares } from "../../middleware/base.middleware.js";
import userRouter from "./user-public.routes.js";
import sharingRouter from "./sharing-public.routes.js";

const publicRouter = Router();

publicMiddlewares.forEach((m) => publicRouter.use(m));

publicRouter.use("/user", userRouter);
// publicRouter.use("/sharing", sharingRouter);
publicRouter.use("/shared", sharingRouter); 

export default publicRouter;
