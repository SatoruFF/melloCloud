import "dotenv/config.js";
import type { Context } from "hono";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { serializeBigInt } from "../helpers/serializeBigInt.js";
import { MessageService } from "../services/messagesService.js";
import ApiContext from "../models/context.js";

class MessageControllerClass {
  async getMessages(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const query = c.req.query();
      const chatId = query.chatId as string | undefined;
      const limit = Number(query.limit ?? 50);
      const offset = Number(query.offset ?? 0);

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!chatId) {
        throw createError(400, "chatId is required");
      }

      const messages = await MessageService.getPaginatedMessagesByChatId({
        chatId: Number(chatId),
        limit,
        offset,
        userId,
      });

      return c.json(serializeBigInt(messages), 200);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json(
        {
          message: error.message,
        },
        error.statusCode || 500,
      );
    }
  }
}

export const MessageController = new MessageControllerClass();
