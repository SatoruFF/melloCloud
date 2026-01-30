import "dotenv/config";
import http from "http";
import type { IncomingHttpHeaders } from "http";
import app from "./app";
import { PORT } from "./configs/config";
import { logger as customLogger } from "./configs/logger";
import { setupWebSocketServer } from "./helpers/setupWebSocket";

const port = Number(PORT) || 3000;

function headersToRecord(headers: IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      out[key] = Array.isArray(value) ? value[0] : value;
    }
  }
  return out;
}

interface FetchGlobals {
  Request: new (
    input: string | URL,
    init?: { method?: string; headers?: Record<string, string> },
  ) => object;
  WritableStream: new (underlyingSink?: {
    write?(chunk: unknown): void;
    close?(): void;
  }) => object;
}

const { Request: RequestCtor, WritableStream: WritableStreamCtor } =
  globalThis as unknown as FetchGlobals;

const server = http.createServer((req, res) => {
  app
    .fetch(
      new RequestCtor(`http://localhost${req.url}`, {
        method: req.method,
        headers: headersToRecord(req.headers),
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

// WebSocket setup 
setupWebSocketServer(server);

server.listen(port, () => {
  customLogger.info(`⚡️[server]: 🚀 Bun server (HTTP + WS) is running at: ${port}`);
});
