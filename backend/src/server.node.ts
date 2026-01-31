import "dotenv/config";
import cluster from "cluster";
import { cpus } from "os";
import { serve } from "@hono/node-server";

import app from "./app";
import { setupWebSocketServer } from "./helpers/setupWebSocket";
import { PORT } from "./configs/config";
import { logger as customLogger } from "./configs/logger";

const numCPU = cpus().length;

if (cluster.isPrimary) {
  const workerCounts = Number(process.env.WORKERS_COUNT) || numCPU;

  for (let i = 0; i < workerCounts; i++) {
    cluster.fork();
  }

  cluster.on("online", (worker) => {
    customLogger.info(`Worker ${worker.process.pid} is alive.`);
  });

  cluster.on("exit", (worker) => {
    customLogger.error(`Worker ${worker.process.pid} died.`);
    cluster.fork(); // Restart dead worker
  });
} else {
  const start = async () => {
    try {
      const port = Number(PORT) || 3000;

      // Создаём HTTP сервер и подключаем Hono
      const server = serve({
        fetch: app.fetch,
        port,
      });

      // WebSocket setup (использует созданный http.Server)
      setupWebSocketServer(server as any);

      customLogger.info(`⚡️[server]: 🚀 Node server is running at: ${port}`);
    } catch (e: any) {
      customLogger.error(e.message);
    }
  };

  void start();
}
