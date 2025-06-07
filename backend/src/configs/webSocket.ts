import { WebSocketServer } from "ws";
import { PORT } from "./config.js";

/**
 * @deprecated
 */
const WSConfig = {
  port: PORT,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
};

export function getWebSocketConnection(server) {
  return new WebSocketServer({
    server,
    handleProtocols: (protocols, request) => {
      const token = protocols[0]; // Наш токен
      return token; // Эхо обратно клиенту — иначе соединение разорвётся
    },
  });
}
