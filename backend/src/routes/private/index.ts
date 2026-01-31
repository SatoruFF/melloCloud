import { Hono } from 'hono';
import { privateMiddlewares } from '../../middleware/base.middleware';
import userRouter from './user.routes';
import fileRouter from './file.routes';
import chatsRouter from './chat.routes';
import messagesRouter from './message.routes';
import taskRouter from './task.routes';
import taskColumn from './column.routes';
import boardRouter from './board.routes';
import noteRouter from './note.routes';
import eventRouter from './events.routes';
import webhookRouter from './webhook.routes';

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

export default privateRouter;
