import "dotenv/config.js";
import type { Context } from "hono";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { ChatService } from "../services/chatService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";
import ApiContext from "../models/context.js";

class ChatControllerClass {
  async getUserChats(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      // Fetch user chats
      // user cannot have more than 1000 chats USUALLY, so no pagination needed
      const chats = await ChatService.getUserChats(apiContext, userId);

      return c.json(serializeBigInt(chats));
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

export const ChatController = new ChatControllerClass();
