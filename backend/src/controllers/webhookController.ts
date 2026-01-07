import type { Request, Response } from "express";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { WebhookService } from "../services/webhookService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";

class WebhookControllerClass {
  // Получить все webhooks пользователя
  async getUserWebhooks(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      if (!userId) {
        throw createError(401, "User not found");
      }

      const webhooks = await req.context.prisma.webhook.findMany({
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

      return res.json(serializeBigInt(webhooks));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Получить один webhook
  async getWebhook(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { webhookId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const webhook = await req.context.prisma.webhook.findFirst({
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

      return res.json(serializeBigInt(webhook));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Создать webhook
  async createWebhook(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { name, description, url, method, events, filters, headers, retryCount, retryDelay } =
        req.body;

      if (!userId) {
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

      const webhook = await req.context.prisma.webhook.create({
        data: {
          userId,
          name,
          description,
          url,
          method: method || "POST",
          events,
          filters: filters || null,
          headers: headers || null,
          retryCount: retryCount || 3,
          retryDelay: retryDelay || 60,
          status: "ACTIVE",
        },
      });

      return res.status(201).json(serializeBigInt(webhook));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Обновить webhook
  async updateWebhook(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { webhookId } = req.params;
      const { name, description, url, method, events, filters, headers, retryCount, retryDelay, status } =
        req.body;

      if (!userId) {
        throw createError(401, "User not found");
      }

      // Проверяем что webhook существует и принадлежит пользователю
      const existingWebhook = await req.context.prisma.webhook.findFirst({
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

      const webhook = await req.context.prisma.webhook.update({
        where: { id: +webhookId },
        data: updateData,
      });

      return res.json(serializeBigInt(webhook));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Удалить webhook
  async deleteWebhook(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { webhookId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const existingWebhook = await req.context.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
      });

      if (!existingWebhook) {
        throw createError(404, "Webhook not found");
      }

      await req.context.prisma.webhook.delete({
        where: { id: +webhookId },
      });

      return res.json({ message: "Webhook deleted successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Тестовый запуск webhook
  async testWebhook(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { webhookId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const webhook = await req.context.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
      });

      if (!webhook) {
        throw createError(404, "Webhook not found");
      }

      // Выполняем тестовый webhook
      await WebhookService.executeWebhook(req.context, webhook, "CUSTOM", {
        event: "TEST",
        resourceType: "TEST",
        resourceId: 0,
        data: {
          message: "This is a test webhook",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      return res.json({ message: "Test webhook triggered successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Получить историю выполнений
  async getWebhookExecutions(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { webhookId } = req.params;
      const { limit = "50", offset = "0" } = req.query;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const webhook = await req.context.prisma.webhook.findFirst({
        where: {
          id: +webhookId,
          userId,
        },
      });

      if (!webhook) {
        throw createError(404, "Webhook not found");
      }

      const executions = await req.context.prisma.webhookExecution.findMany({
        where: {
          webhookId: +webhookId,
        },
        orderBy: { triggeredAt: "desc" },
        take: +limit,
        skip: +offset,
      });

      const total = await req.context.prisma.webhookExecution.count({
        where: {
          webhookId: +webhookId,
        },
      });

      return res.json(
        serializeBigInt({
          executions,
          total,
          limit: +limit,
          offset: +offset,
        })
      );
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Получить запланированные webhooks
  async getScheduledWebhooks(req: Request, res: Response) {
    try {
      const { userId } = req.context;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const scheduled = await req.context.prisma.scheduledWebhook.findMany({
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

      return res.json(serializeBigInt(scheduled));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Получить доступные события для подписки
  async getAvailableEvents(req: Request, res: Response) {
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

      return res.json(events);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const WebhookController = new WebhookControllerClass();
