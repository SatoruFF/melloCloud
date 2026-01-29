import "dotenv/config";
import http from "http";
import app from "./app";
import { PORT } from "./configs/config";
import { logger as customLogger } from "./configs/logger";
import { setupWebSocketServer } from "./helpers/setupWebSocket";

const port = Number(PORT) || 3000;

const server = http.createServer((req, res) => {
  const RequestCtor = (globalThis as any).Request;
  const WritableStreamCtor = (globalThis as any).WritableStream;

  app
    .fetch(
      new RequestCtor(`http://localhost${req.url}`, {
        method: req.method,
        headers: req.headers as any,
      }),
    )
    .then((response) => {
      res.writeHead(response.status, Object.fromEntries(response.headers));
      response.body?.pipeTo(
        new WritableStreamCtor({
          write(chunk) {
            res.write(chunk);
          },
          close() {
            res.end();
          },
        }),
      );
    });
});

// WebSocket setup (тот же ws-сервер, что и раньше)
setupWebSocketServer(server);

server.listen(port, () => {
  customLogger.info(`⚡️[server]: 🚀 Bun server (HTTP + WS) is running at: ${port}`);
});
