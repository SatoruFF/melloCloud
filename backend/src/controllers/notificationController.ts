import type { Context } from "hono";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { NotificationService } from "../services/notificationService.js";

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
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async getUnreadCount(c: Context) {
    try {
      const userId = getUserId(c);
      const count = await NotificationService.getUnreadCount(userId);
      return c.json({ count });
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async markAsRead(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) throw createError(400, "Notification ID is required");
      const userId = getUserId(c);
      const notification = await NotificationService.markAsRead(Number(id), userId);
      return c.json(notification);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async markAllAsRead(c: Context) {
    try {
      const userId = getUserId(c);
      const result = await NotificationService.markAllAsRead(userId);
      return c.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async remove(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) throw createError(400, "Notification ID is required");
      const userId = getUserId(c);
      const result = await NotificationService.remove(Number(id), userId);
      return c.json(result, 200);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async clearAll(c: Context) {
    try {
      const userId = getUserId(c);
      const result = await NotificationService.clearAll(userId);
      return c.json(result, 200);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const NotificationController = new NotificationControllerClass();
