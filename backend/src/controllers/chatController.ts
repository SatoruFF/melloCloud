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

  async createGroupChat(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) {
        throw createError(401, "User not found");
      }

      const body = await c.req.json().catch(() => ({}));
      const title = String(body.title ?? "").trim();
      const participantIds = Array.isArray(body.participantIds)
        ? body.participantIds.map(Number).filter((n: number) => Number.isInteger(n) && n > 0)
        : [];

      if (!title) {
        throw createError(400, "title is required");
      }

      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const chat = await ChatService.createGroupChat(apiContext, {
        title,
        creatorId: userId,
        participantIds,
      });

      const response = {
        id: chat.id,
        title,
        isGroup: true,
        receiver: null,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
      return c.json(serializeBigInt(response), 201);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json(
        { message: error.message },
        error.statusCode || 500
      );
    }
  }
}

export const ChatController = new ChatControllerClass();
