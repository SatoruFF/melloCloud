import { Hono } from 'hono';
import { privateMiddlewares } from "../../middleware/base.middleware.js";
import userRouter from "./user.routes.js";
import fileRouter from "./file.routes.js";
import chatsRouter from "./chat.routes.js";
import messagesRouter from "./message.routes.js";
import taskRouter from "./task.routes.js";
import taskColumn from "./column.routes.js";
import boardRouter from "./board.routes.js";
import noteRouter from "./note.routes.js";
import eventRouter from "./events.routes.js";
import webhookRouter from "./webhook.routes.js";
import notificationRouter from "./notification.routes.js";
import sharingRouter from "./sharing.hono.routes.js";
import adminRouter from "./admin.routes.js";
import featureFlagsRouter from "./featureFlags.routes.js";

const privateRouter = new Hono();

// Apply auth middleware
privateMiddlewares.forEach((m) => privateRouter.use('*', m));

privateRouter.route('/user', userRouter);
privateRouter.route('/file', fileRouter);
privateRouter.route('/chats', chatsRouter);
privateRouter.route('/messages', messagesRouter);
privateRouter.route('/tasks', taskRouter);
privateRouter.route('/columns', taskColumn);
privateRouter.route('/boards', boardRouter);
privateRouter.route('/notes', noteRouter);
privateRouter.route('/events', eventRouter);
privateRouter.route('/webhooks', webhookRouter);
privateRouter.route('/notifications', notificationRouter);
privateRouter.route('/sharing', sharingRouter);
privateRouter.route('/admin', adminRouter);
privateRouter.route('/feature-flags', featureFlagsRouter);

export default privateRouter;
