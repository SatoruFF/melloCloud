import _ from 'lodash';
import { prisma } from '../configs/config';
import { logger } from '../configs/logger';
import type { IMessage } from '../types/Message';
import { z } from 'zod';

// Схема для валидации сообщений
const messageSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  senderId: z.number().int().positive('Sender ID must be a positive integer'),
  chatId: z.number().int().positive('Chat ID must be a positive integer'),
});

class MessagesServiceClass<T extends IMessage> {
  public message: T;

  constructor(message?: T) {
    this.message = message || ({} as T); // Используем приведение типов вместо @ts-ignore
  }

  /**
   * Сохраняет сообщение в базу данных.
   * @param message - Сообщение для сохранения.
   * @returns Сохраненное сообщение.
   */
  static async saveMessage(message: IMessage) {
    try {
      // Валидация сообщения
      const validatedMessage = messageSchema.parse(message);

      return await prisma.$transaction(async trx => {
        const savedMessage = await trx.message.create({
          data: {
            text: validatedMessage.text,
            senderId: validatedMessage.senderId,
            chatId: validatedMessage.chatId,
          },
        });

        logger.info('Message saved to database:', savedMessage);
        return savedMessage;
      });
    } catch (error) {
      logger.error('Error saving message:', error);
      throw new Error('Failed to save message');
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
        orderBy: { createdAt: 'asc' },
      });

      logger.info(`Retrieved ${messages.length} messages for chat ${chatId}`);
      return messages;
    } catch (error) {
      logger.error('Error retrieving messages:', error);
      throw new Error('Failed to retrieve messages');
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

      logger.info('Message deleted:', deletedMessage);
      return deletedMessage;
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
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

      logger.info('Message updated:', updatedMessage);
      return updatedMessage;
    } catch (error) {
      logger.error('Error updating message:', error);
      throw new Error('Failed to update message');
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
