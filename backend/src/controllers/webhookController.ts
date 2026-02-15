import type { Context } from "hono";
import type { WebhookEvent, WebhookMethod } from "@prisma/client";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { WebhookService } from "../services/webhookService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";
import ApiContext from "../models/context.js";

class WebhookControllerClass {
  // Получить все webhooks пользователя
  async getUserWebhooks(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      const webhooks = await apiContext.prisma.webhook.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              executions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json(serializeBigInt(webhooks));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Получить один webhook
  async getWebhook(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { webhookId } = c.req.param();

      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      const webhook = await apiContext.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
        include: {
          executions: {
            orderBy: { triggeredAt: "desc" },
            take: 10, // последние 10 выполнений
          },
          _count: {
            select: {
              executions: true,
            },
          },
        },
      });

      if (!webhook) {
        throw createError(404, "Webhook not found");
      }

      return c.json(serializeBigInt(webhook));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Создать webhook
  async createWebhook(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { name, description, url, method, events, filters, headers, retryCount, retryDelay } = await c.req.json<{
        name: string;
        description?: string;
        url: string;
        method?: string;
        events: string[];
        filters?: unknown;
        headers?: unknown;
        retryCount?: number;
        retryDelay?: number;
      }>();

      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      if (!name || !url || !events || events.length === 0) {
        throw createError(400, "Name, URL, and events are required");
      }

      // Валидация URL
      try {
        new URL(url);
      } catch {
        throw createError(400, "Invalid URL format");
      }

      const webhook = await apiContext.prisma.webhook.create({
        data: {
          userId,
          name,
          description,
          url,
          method: (method || "POST") as WebhookMethod,
          events: events as WebhookEvent[],
          filters: (filters ?? null) as object | null,
          headers: (headers ?? null) as object | null,
          retryCount: retryCount || 3,
          retryDelay: retryDelay || 60,
          status: "ACTIVE",
        },
      });

      return c.json(serializeBigInt(webhook), 201);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Обновить webhook
  async updateWebhook(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { webhookId } = c.req.param();
      const { name, description, url, method, events, filters, headers, retryCount, retryDelay, status } =
        await c.req.json<{
          name?: string;
          description?: string;
          url?: string;
          method?: string;
          events?: string[];
          filters?: unknown;
          headers?: unknown;
          retryCount?: number;
          retryDelay?: number;
          status?: string;
        }>();

      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      // Проверяем что webhook существует и принадлежит пользователю
      const existingWebhook = await apiContext.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
      });

      if (!existingWebhook) {
        throw createError(404, "Webhook not found");
      }

      // Валидация URL если он меняется
      if (url) {
        try {
          new URL(url);
        } catch {
          throw createError(400, "Invalid URL format");
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (url !== undefined) updateData.url = url;
      if (method !== undefined) updateData.method = method;
      if (events !== undefined) updateData.events = events;
      if (filters !== undefined) updateData.filters = filters;
      if (headers !== undefined) updateData.headers = headers;
      if (retryCount !== undefined) updateData.retryCount = retryCount;
      if (retryDelay !== undefined) updateData.retryDelay = retryDelay;
      if (status !== undefined) updateData.status = status;

      const webhook = await apiContext.prisma.webhook.update({
        where: { id: +webhookId },
        data: updateData,
      });

      return c.json(serializeBigInt(webhook));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Удалить webhook
  async deleteWebhook(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { webhookId } = c.req.param();

      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      const existingWebhook = await apiContext.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
      });

      if (!existingWebhook) {
        throw createError(404, "Webhook not found");
      }

      await apiContext.prisma.webhook.delete({
        where: { id: +webhookId },
      });

      return c.json({ message: "Webhook deleted successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Тестовый запуск webhook
  async testWebhook(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { webhookId } = c.req.param();

      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      const webhook = await apiContext.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
      });

      if (!webhook) {
        throw createError(404, "Webhook not found");
      }

      // Выполняем тестовый webhook
      await WebhookService.executeWebhook(apiContext, webhook, "CUSTOM", {
        event: "TEST",
        resourceType: "TEST",
        resourceId: 0,
        data: {
          message: "This is a test webhook",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      return c.json({ message: "Test webhook triggered successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Получить историю выполнений
  async getWebhookExecutions(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { webhookId } = c.req.param();
      const query = c.req.query();
      const limit = Number(query.limit ?? "50");
      const offset = Number(query.offset ?? "0");

      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      const webhook = await apiContext.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
      });

      if (!webhook) {
        throw createError(404, "Webhook not found");
      }

      const executions = await apiContext.prisma.webhookExecution.findMany({
        where: {
          webhookId: +webhookId,
        },
        orderBy: { triggeredAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await apiContext.prisma.webhookExecution.count({
        where: {
          webhookId: +webhookId,
        },
      });

      return c.json(
        serializeBigInt({
          executions,
          total,
          limit,
          offset,
        }),
      );
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Получить запланированные webhooks
  async getScheduledWebhooks(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId || !apiContext) {
        throw createError(401, "User not found");
      }

      const scheduled = await apiContext.prisma.scheduledWebhook.findMany({
        where: {
          webhook: {
            userId,
          },
          executed: false,
        },
        include: {
          webhook: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { scheduledFor: "asc" },
      });

      return c.json(serializeBigInt(scheduled));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Получить доступные события для подписки
  async getAvailableEvents(c: Context) {
    try {
      const events = [
        {
          event: "EVENT_CREATED",
          category: "Calendar",
          description: "Triggered when a new calendar event is created",
        },
        {
          event: "EVENT_UPDATED",
          category: "Calendar",
          description: "Triggered when a calendar event is updated",
        },
        {
          event: "EVENT_DELETED",
          category: "Calendar",
          description: "Triggered when a calendar event is deleted",
        },
        {
          event: "EVENT_REMINDER_1H",
          category: "Calendar",
          description: "Triggered 1 hour before event starts",
        },
        {
          event: "EVENT_REMINDER_1D",
          category: "Calendar",
          description: "Triggered 1 day before event starts",
        },
        {
          event: "TASK_CREATED",
          category: "Tasks",
          description: "Triggered when a new task is created",
        },
        {
          event: "TASK_UPDATED",
          category: "Tasks",
          description: "Triggered when a task is updated",
        },
        {
          event: "TASK_COMPLETED",
          category: "Tasks",
          description: "Triggered when a task is marked as completed",
        },
        {
          event: "TASK_OVERDUE",
          category: "Tasks",
          description: "Triggered when a task becomes overdue",
        },
        {
          event: "TASK_DUE_SOON",
          category: "Tasks",
          description: "Triggered when a task is due soon",
        },
        {
          event: "NOTE_CREATED",
          category: "Notes",
          description: "Triggered when a new note is created",
        },
        {
          event: "NOTE_UPDATED",
          category: "Notes",
          description: "Triggered when a note is updated",
        },
        {
          event: "FILE_UPLOADED",
          category: "Files",
          description: "Triggered when a file is uploaded",
        },
        {
          event: "CUSTOM",
          category: "Custom",
          description: "Custom webhook event",
        },
      ];

      return c.json(events);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const WebhookController = new WebhookControllerClass();
