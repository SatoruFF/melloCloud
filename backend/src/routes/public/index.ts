import { Hono } from 'hono';
import { publicMiddlewares } from '../../middleware/base.middleware';
import userRouter from './user-public.routes';

const publicRouter = new Hono();

// middleware
publicMiddlewares.forEach((m) => publicRouter.use('*', m));

publicRouter.route('/user', userRouter);

export default publicRouter;
