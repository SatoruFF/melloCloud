import cluster from "cluster";
import { cpus } from "os";
import { serve } from "@hono/node-server";

import app from "./app";
import { getWebSocketConnection } from "./configs/webSocket";
import { setupWebSocketServer } from "./helpers/setupWebSocket";
import { setupNoteWebSocket } from "./helpers/noteWebSocket";
import { PORT, WORKERS_COUNT } from "./configs/config";
import { logger as customLogger } from "./configs/logger";

const numCPU = cpus().length;

if (cluster.isPrimary) {
  const workerCounts = WORKERS_COUNT || numCPU;

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

      // WebSocket: chat на /ws/chat, коллаборация заметок на /ws/notes
      setupWebSocketServer(server as import("http").Server);
      const wssNotes = getWebSocketConnection(server as import("http").Server, "/ws/notes");
      setupNoteWebSocket(wssNotes);

      customLogger.info(`⚡️[server]: 🚀 Node server is running at: ${port}`);
    } catch (e: any) {
      customLogger.error(e.message);
    }
  };

  void start();
}
