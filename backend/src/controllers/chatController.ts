import _ from "lodash";
import "dotenv/config.js";
import type { Request, Response } from "express";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { ChatService } from "../services/chatService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";

class ChatControllerClass {
  async getUserChats(req: Request, res: Response) {
    try {
      const { userId } = req.context;

      if (!userId) {
        throw createError(401, "User not found");
      }

      // Fetch user chats
      // user cannot have more than 1000 chats USUALLY, so no pagination needed
      const chats = await ChatService.getUserChats(req.context, userId);

      return res.json(serializeBigInt(chats));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const ChatController = new ChatControllerClass();
