import cluster from "cluster";
import { cpus } from "os";
import { serve } from "@hono/node-server";

import app from "./app.js";
import { getWebSocketConnection } from "./configs/webSocket.js";
import { setupWebSocketServer } from "./helpers/setupWebSocket.js";
// import { setupNoteWebSocket } from "./helpers/noteWebSocket.js"; // Старая система коллаборации - заменена на Yjs
import { setupYjsWebSocket } from "./helpers/yjsWebSocket.js";
import { PORT, WORKERS_COUNT } from "./configs/config.js";
import { logger as customLogger } from "./configs/logger.js";

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

      // WebSocket: chat на /ws/chat
      setupWebSocketServer(server as import("http").Server);

      // Старая система коллаборации заметок - закомментирована, заменена на Yjs
      // const wssNotes = getWebSocketConnection(server as import("http").Server, "/ws/notes");
      // setupNoteWebSocket(wssNotes);

      // Yjs WebSocket для новой системы коллаборации на /ws/yjs-notes
      const wssYjsNotes = getWebSocketConnection(server as import("http").Server, "/ws/yjs-notes");
      setupYjsWebSocket(wssYjsNotes);

      customLogger.info(`⚡️[server]: 🚀 Node server is running at: ${port}`);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      customLogger.error(error.message);
    }
  };

  void start();
}
