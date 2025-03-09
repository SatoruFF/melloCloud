// bases
import express, { Express, Response } from 'express';
import router from './routes/index.js';

import cookieParser from 'cookie-parser';
// middleware
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { routesMiddleWare } from './middleware/routes.middleware.js';

import qs from 'qs';
// utils
import { logger } from './configs/logger.js';
import 'dotenv/config.js';

// performing
import cluster from 'cluster';
import { cpus } from 'os';
import { limiter } from './configs/rateLimiter.js';
const numCPU = cpus().length;

// base consts
const app: Express = express();
const port = process.env.PORT || 3002;

// middleware
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({}));
app.use(limiter);
// app.use(express.static('static'))

app.set('query parser', function (str) {
  const depth = 15;
  return qs.parse(str, { depth });
});

app.use(routesMiddleWare);
// routes
app.use(router);

// check health
app.all('/', (_, res: Response) => {
  res.send('i am alive ;)');
});

if (cluster.isPrimary) {
  const workerCounts = Number(process.env.WORKERS_COUNT) || numCPU;

  // Create a worker for each CPU
  for (let i = 0; i < workerCounts; i++) {
    cluster.fork();
  }

  cluster.on('online', function (worker) {
    logger.info('Worker ' + worker.process.pid + ' is alive.');
  });

  cluster.on('exit', function (worker, code, signal) {
    logger.error('worker ' + worker.process.pid + ' died.');
  });
} else {
  // main def
  const start = async () => {
    try {
      app.listen(port, () => {
        logger.info(`⚡️[server]: 🚀 Server is running at: ${port}`);
      });
    } catch (e) {
      logger.warn(e);
    }
  };

  start();
}
