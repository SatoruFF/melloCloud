import type { Context } from "hono";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { NotificationService } from "../services/notificationService.js";
import { getErrorMessage, getErrorStatusCode } from "../types/errors.js";

function getUserId(c: Context): number {
  const user = c.get("user") as { id?: number } | undefined;
  const userId = user?.id ?? c.get("userId");
  if (!userId) {
    throw createError(401, "User not found");
  }
  return userId as number;
}

class NotificationControllerClass {
  async getAll(c: Context) {
    try {
      const userId = getUserId(c);
      const list = await NotificationService.getAll(userId);
      return c.json(list);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async getUnreadCount(c: Context) {
    try {
      const userId = getUserId(c);
      const count = await NotificationService.getUnreadCount(userId);
      return c.json({ count });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async markAsRead(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) throw createError(400, "Notification ID is required");
      const userId = getUserId(c);
      const notification = await NotificationService.markAsRead(Number(id), userId);
      return c.json(notification);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async markAllAsRead(c: Context) {
    try {
      const userId = getUserId(c);
      const result = await NotificationService.markAllAsRead(userId);
      return c.json(result);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async remove(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) throw createError(400, "Notification ID is required");
      const userId = getUserId(c);
      const result = await NotificationService.remove(Number(id), userId);
      return c.json(result, 200);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async clearAll(c: Context) {
    try {
      const userId = getUserId(c);
      const result = await NotificationService.clearAll(userId);
      return c.json(result, 200);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }
}

export const NotificationController = new NotificationControllerClass();
