import _ from "lodash";
import { prisma } from "../configs/config.js";
import { logger } from "../configs/logger.js";
import type { IMessage } from "../types/Message.js";
import { z } from "zod";
import { ChatService } from "./chatService.js";

// Схема для валидации сообщений
const messageSchema = z.object({
  text: z.string().min(1, "Text is required"),
  senderId: z.number().int().positive("Sender ID must be a positive integer"),
  receiverId: z.number().int().positive("Receiver ID must be a positive integer").optional(),
  chatId: z.number().int().positive("Chat ID must be a positive integer").optional(),
});

class MessagesServiceClass<T extends IMessage> {
  public message: T;

  constructor(message?: T) {
    this.message = message || ({} as T); // Используем приведение типов вместо @ts-ignore
  }

  /**
   * Получает сообщения по chatId с лимитом и офсетом, только если пользователь участвует в чате.
   * @param userId - ID пользователя.
   * @param chatId - ID чата.
   * @param limit - Количество сообщений.
   * @param offset - Смещение.
   * @returns Список сообщений.
   */
  async getPaginatedMessagesByChatId({ userId, chatId, limit = 20, offset = 0 }) {
    try {
      // Проверка, что пользователь состоит в чате
      const isUserInChat = await prisma.chatUser.findFirst({
        where: {
          chatId,
          userId,
        },
      });

      if (!isUserInChat) {
        throw new Error("Access denied: user is not part of this chat.");
      }

      // Получение сообщений с пагинацией
      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "desc" }, // Для чатов обычно от новых к старым
        skip: offset,
        take: limit,
      });

      logger.info(
        `User ${userId} retrieved ${messages.length} messages from chat ${chatId} (offset: ${offset}, limit: ${limit})`
      );

      return messages;
    } catch (error) {
      logger.error("Error retrieving paginated messages:", error);
      throw new Error("Failed to retrieve messages");
    }
  }

  /**
   * Сохраняет сообщение в базу данных.
   * @param message - Сообщение для сохранения.
   * @returns Сохраненное сообщение.
   */
  async saveMessage(context, message: IMessage) {
    try {
      // Валидация сообщения
      const validatedMessage = messageSchema.parse(message);

      return context.prisma.$transaction(async (trx) => {
        const chatId = await ChatService.getOrCreatePrivateChat(trx, {
          senderId: message.senderId,
          receiverId: message.receiverId,
          text: validatedMessage.text,
        });

        const savedMessage = await trx.message.create({
          data: {
            text: validatedMessage.text,
            senderId: validatedMessage.senderId,
            chatId,
          },
        });

        logger.info("Message saved to database:", savedMessage);
        return savedMessage;
      });
    } catch (error) {
      logger.error("Error saving message:", error);
      throw new Error("Failed to save message");
    }
  }

  /**
   * Получает сообщения по chatId.
   * @param chatId - ID чата.
   * @returns Список сообщений.
   */
  static async getMessagesByChatId(chatId: number) {
    try {
      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
      });

      logger.info(`Retrieved ${messages.length} messages for chat ${chatId}`);
      return messages;
    } catch (error) {
      logger.error("Error retrieving messages:", error);
      throw new Error("Failed to retrieve messages");
    }
  }

  /**
   * Удаляет сообщение по ID.
   * @param messageId - ID сообщения.
   * @returns Удаленное сообщение.
   */
  static async deleteMessage(messageId: number) {
    try {
      const deletedMessage = await prisma.message.delete({
        where: { id: messageId },
      });

      logger.info("Message deleted:", deletedMessage);
      return deletedMessage;
    } catch (error) {
      logger.error("Error deleting message:", error);
      throw new Error("Failed to delete message");
    }
  }

  /**
   * Обновляет сообщение.
   * @param messageId - ID сообщения.
   * @param updates - Обновленные данные.
   * @returns Обновленное сообщение.
   */
  static async updateMessage(messageId: number, updates: Partial<IMessage>) {
    try {
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: updates,
      });

      logger.info("Message updated:", updatedMessage);
      return updatedMessage;
    } catch (error) {
      logger.error("Error updating message:", error);
      throw new Error("Failed to update message");
    }
  }

  /**
   * Возвращает текущее сообщение.
   * @returns Текущее сообщение.
   */
  getMessage(): T {
    return this.message;
  }

  /**
   * Выводит информацию о сообщении в консоль.
   */
  printMessage(): void {
    console.log(`Text: ${this.message.text}, Sender ID: ${this.message.senderId}, Chat ID: ${this.message.chatId}`);
  }
}

export const MessageService = new MessagesServiceClass<IMessage>();
