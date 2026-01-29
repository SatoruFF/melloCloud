import { Hono } from 'hono';
import publicRouter from './public/index';
import privateRouter from './private/index';

const v1Router = new Hono();

v1Router.route('/', publicRouter);
v1Router.route('/', privateRouter);

export default v1Router;
