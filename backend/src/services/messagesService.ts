import { serializeMessage, deserializeMessage } from "./../helpers/messageSerializer.js";
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
    this.message = message || ({} as T);
  }

  /**
   * Получает сообщения по chatId с лимитом и офсетом, только если пользователь участвует в чате.
   * @param userId - ID пользователя.
   * @param chatId - ID чата.
   * @param limit - Количество сообщений.
   * @param offset - Смещение.
   * @param decrypt - Расшифровать сообщения (по умолчанию true).
   * @returns Список сообщений.
   */
  async getPaginatedMessagesByChatId({ userId, chatId, limit = 20, offset = 0, decrypt = true }) {
    try {
      const isUserInChat = await prisma.chatUser.findFirst({
        where: { chatId, userId },
      });

      if (!isUserInChat) {
        throw new Error("Access denied: user is not part of this chat.");
      }

      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });

      // Расшифровка сообщений если требуется
      const processedMessages = decrypt
        ? await Promise.all(
            messages.map(async (msg) => ({
              ...msg,
              text: (await deserializeMessage<Partial<IMessage>>(msg.text))?.text || msg.text,
            }))
          )
        : messages;

      logger.info(
        `User ${userId} retrieved ${messages.length} messages from chat ${chatId} (offset: ${offset}, limit: ${limit})`
      );

      return processedMessages;
    } catch (error) {
      logger.error("Error retrieving paginated messages:", error);
      throw new Error("Failed to retrieve messages");
    }
  }

  /**
   * Сохраняет зашифрованное сообщение в базу данных.
   * @param context - Контекст с prisma.
   * @param message - Сообщение для сохранения.
   * @param encrypt - Шифровать сообщение (по умолчанию true).
   * @returns Сохраненное сообщение.
   */
  async saveMessage(context, message: IMessage, encrypt = true) {
    try {
      const validatedMessage = messageSchema.parse(message);

      // Шифруем текст сообщения
      const textToSave = encrypt ? await serializeMessage({ text: validatedMessage.text }) : validatedMessage.text;

      return context.prisma.$transaction(async (trx) => {
        const chatId = await ChatService.getOrCreatePrivateChat(trx, {
          senderId: message.senderId,
          receiverId: message.receiverId,
          text: validatedMessage.text,
        });

        const savedMessage = await trx.message.create({
          data: {
            text: textToSave,
            senderId: validatedMessage.senderId,
            chatId,
          },
        });

        logger.info("Encrypted message saved to database:", { id: savedMessage.id });
        // Возвращаем клиенту сообщение с расшифрованным текстом для отображения
        return { ...savedMessage, text: validatedMessage.text };
      });
    } catch (error) {
      logger.error("Error saving message:", error);
      throw new Error("Failed to save message");
    }
  }

  /**
   * Получает сообщения по chatId.
   * @param chatId - ID чата.
   * @param decrypt - Расшифровать сообщения (по умолчанию true).
   * @returns Список сообщений.
   */
  static async getMessagesByChatId(chatId: number, decrypt = true) {
    try {
      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
      });

      const processedMessages = decrypt
        ? await Promise.all(
            messages.map(async (msg) => ({
              ...msg,
              text: (await deserializeMessage<{ text: string }>(msg.text)).text,
            }))
          )
        : messages;

      logger.info(`Retrieved ${messages.length} messages for chat ${chatId}`);
      return processedMessages;
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
   * Обновляет сообщение (с шифрованием текста если требуется).
   * @param messageId - ID сообщения.
   * @param updates - Обновленные данные.
   * @param encrypt - Шифровать текст (по умолчанию true).
   * @returns Обновленное сообщение.
   */
  static async updateMessage(messageId: number, updates: Partial<IMessage>, encrypt = true) {
    try {
      const dataToUpdate = { ...updates };

      if (updates.text && encrypt) {
        dataToUpdate.text = await serializeMessage({ text: updates.text });
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: dataToUpdate,
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
