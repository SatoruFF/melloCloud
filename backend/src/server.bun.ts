import "dotenv/config";
import http from "http";
import type { IncomingHttpHeaders } from "http";
import app from "./app.js";
import { PORT } from "./configs/config.js";
import { logger as customLogger } from "./configs/logger.js";
import { getWebSocketConnection } from "./configs/webSocket.js";
import { setupWebSocketServer } from "./helpers/setupWebSocket.js";
// import { setupNoteWebSocket } from "./helpers/noteWebSocket.js"; // Старая система коллаборации - заменена на Yjs
import { setupYjsWebSocket } from "./helpers/yjsWebSocket.js";

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
    }
  ) => object;
  WritableStream: new (underlyingSink?: { write?(chunk: unknown): void; close?(): void }) => object;
}

const { Request: RequestCtor, WritableStream: WritableStreamCtor } = globalThis as unknown as FetchGlobals;

function readBody(req: http.IncomingMessage): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(chunks.length > 0 ? Buffer.concat(chunks as unknown as readonly Uint8Array[]) : null));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const body = hasBody ? await readBody(req) : null;
    const request = new RequestCtor(`http://localhost${req.url}`, {
      method: req.method,
      headers: headersToRecord(req.headers),
      ...(body && body.length > 0 && { body }),
    }) as Request;
    const response = await app.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      const writable = new WritableStreamCtor({
        write(chunk: unknown) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      }) as WritableStream<Uint8Array>;
      response.body.pipeTo(writable);
    } else {
      res.end();
    }
  } catch (err) {
    customLogger.error(err instanceof Error ? err.message : String(err));
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

// WebSocket: chat на /ws/chat
setupWebSocketServer(server);

// Старая система коллаборации заметок - закомментирована, заменена на Yjs
// const wssNotes = getWebSocketConnection(server, "/ws/notes");
// setupNoteWebSocket(wssNotes);

// Yjs WebSocket для новой системы коллаборации на /ws/yjs-notes
const wssYjsNotes = getWebSocketConnection(server, "/ws/yjs-notes");
setupYjsWebSocket(wssYjsNotes);

server.listen(port, () => {
  customLogger.info(`⚡️[server]: 🚀 Bun server (HTTP + WS) is running at: ${port}`);
});
