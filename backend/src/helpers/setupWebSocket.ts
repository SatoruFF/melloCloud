import jwt from "jsonwebtoken";
import type http from "http";
import { MessageService } from "../services/messagesService.js";
import { getWebSocketConnection } from "../configs/webSocket.js";
import { logger } from "../configs/logger.js";
import { parseJson } from "./parseJson.js";
import ApiContext from "../models/context.js";

const CHAT_WS_PATH = "/ws/chat";

export function setupWebSocketServer(server: http.Server) {
  const wss = getWebSocketConnection(server, CHAT_WS_PATH);

  wss.on("connection", (ws, request) => {
    let context: undefined | ApiContext;
    try {
      const token = request.headers["sec-websocket-protocol"];

      if (!token || Array.isArray(token)) {
        ws.close(1008, "Unauthorized");
        return;
      }

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY as string);
      const userId = Number(decoded.payload) === decoded.payload ? decoded.payload : decoded;

      context = new ApiContext(userId);

      logger.info(`WebSocket connection authorized for user ${userId}`);
    } catch (err) {
      logger.error("WebSocket auth error:", err);
      ws.close(1008, "Invalid token");
      return;
    }

    logger.info(`WebSocket connected (user ${context.userId})`);

    ws.on("message", async (message) => {
      try {
        logger.info("Received message:", message); // TODO: remove
        const messageString = message.toString ? message.toString() : message;
        const messageData = parseJson(messageString);

        const savedMessage = await MessageService.saveMessage(context, messageData);

        // Отправка подтверждения отправителю
        ws.send(JSON.stringify(savedMessage));

        // Рассылка другим участникам
        for (const client of wss.clients) {
          if (client.readyState === 1) {
            client.send(JSON.stringify(savedMessage));
          }
        }
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
