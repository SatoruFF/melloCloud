import _ from "lodash";
import "dotenv/config.js";
import type { Request, Response } from "express";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { ChatService } from "../services/chatService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";
import { MessageService } from "../services/messagesService.js";

class MessageControllerClass {
  async getMessages(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { chatId, limit = 50, offset = 0 } = req.query;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!chatId || typeof chatId !== "string") {
        throw createError(400, "chatId is required");
      }

      const messages = await MessageService.getPaginatedMessagesByChatId({
        chatId: Number(chatId),
        limit: Number(limit),
        offset: Number(offset),
        userId,
      });

      return res.status(200).send(serializeBigInt(messages));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const MessageController = new MessageControllerClass();
