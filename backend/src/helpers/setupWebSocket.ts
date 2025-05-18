import type http from "http";
import { MessageService } from "../services/messagesService.js";
import { getWebSocketConnection } from "../configs/webSocket.js";
import { logger } from "../configs/logger.js";
import parseJSON from "./parseJson.js";

import type { IMessage } from "../types/Message.js";

export function setupWebSocketServer(server: http.Server) {
  const wss = getWebSocketConnection(server);

  wss.on("connection", (ws) => {
    logger.info("New WebSocket connection");

    ws.on("message", async (message) => {
      try {
        const messageString = message.toString ? message.toString() : message;

        const messageData = parseJSON(messageString);

        const savedMessage = await MessageService.saveMessage(messageData);

        ws.send(JSON.stringify({ status: "success", message: savedMessage }));
      } catch (error) {
        logger.error("Error handling message:", error);

        ws.send(
          JSON.stringify({
            status: "error",
            message: "Failed to process message",
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      }
    });

    ws.on("close", () => {
      logger.info("WebSocket connection closed");
    });
  });

  logger.info("WebSocket server is running");
}
