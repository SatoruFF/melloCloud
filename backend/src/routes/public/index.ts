import { Hono } from 'hono';
import { publicMiddlewares } from "../../middleware/base.middleware.js";
import userRouter from "./user-public.routes.js";
import sharingRouter from "./sharing-public.routes.js";

const publicRouter = new Hono();

// middleware
publicMiddlewares.forEach((m) => publicRouter.use('*', m));

publicRouter.route('/user', userRouter);

publicRouter.route("/shared", sharingRouter); 

export default publicRouter;
