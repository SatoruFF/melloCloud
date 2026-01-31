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
    init?: {
      method?: string;
      headers?: Record<string, string>;
      body?: unknown;
    },
  ) => object;
  WritableStream: new (underlyingSink?: {
    write?(chunk: unknown): void;
    close?(): void;
  }) => object;
}

const { Request: RequestCtor, WritableStream: WritableStreamCtor } =
  globalThis as unknown as FetchGlobals;

function readBody(req: http.IncomingMessage): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () =>
      resolve(
        chunks.length > 0
          ? Buffer.concat(chunks as unknown as readonly Uint8Array[])
          : null,
      ),
    );
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const body = hasBody ? await readBody(req) : null;
    const response = await app.fetch(
      new RequestCtor(`http://localhost${req.url}`, {
        method: req.method,
        headers: headersToRecord(req.headers),
        ...(body && body.length > 0 && { body }),
      }),
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      response.body.pipeTo(
        new WritableStreamCtor({
          write(chunk) {
            res.write(chunk);
          },
          close() {
            res.end();
          },
        }),
      );
    } else {
      res.end();
    }
  } catch (err) {
    customLogger.error(err instanceof Error ? err.message : String(err));
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

// WebSocket setup 
setupWebSocketServer(server);

server.listen(port, () => {
  customLogger.info(`⚡️[server]: 🚀 Bun server (HTTP + WS) is running at: ${port}`);
});
