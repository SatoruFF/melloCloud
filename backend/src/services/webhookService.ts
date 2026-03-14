import axios from "axios";
import createError from "http-errors";
import type { Prisma } from "@prisma/client";
import { Webhook, ScheduledWebhook, WebhookExecution, WebhookEvent } from "@prisma/client";
import { logger } from "../configs/logger.js";
import { getErrorMessage } from "../types/errors.js";

interface TriggerWebhookParams {
  event: WebhookEvent;
  resourceType: string;
  resourceId: number;
  data: unknown;
  userId: number;
}

interface WebhookContext {
  prisma: Prisma.TransactionClient;
}

class WebhookServiceClass {
  /**
   * Триггерит все подходящие webhooks для события
   */
  async triggerWebhooks(context: WebhookContext, params: TriggerWebhookParams) {
    const { event, resourceType, resourceId, data, userId } = params;

    // Находим все активные webhooks для этого пользователя и события
    const webhooks = await context.prisma.webhook.findMany({
      where: {
        userId,
        status: "ACTIVE",
        events: {
          has: event,
        },
      },
    });

    if (webhooks.length === 0) {
      logger.info(`No webhooks found for event ${event} and user ${userId}`);
      return;
    }

    // Запускаем все webhooks параллельно
    await Promise.allSettled(
      webhooks.map((webhook) =>
        this.executeWebhook(context, webhook, event, {
          event,
          resourceType,
          resourceId,
          data,
          timestamp: new Date().toISOString(),
        })
      )
    );
  }

  /**
   * Выполняет конкретный webhook
   */
  async executeWebhook(
    context: WebhookContext,
    webhook: Webhook,
    event: string,
    payload: Record<string, unknown>
  ) {
    const startTime = Date.now();
    let attempt = 0;
    let success = false;
    let lastError: Error | null = null;

    // Применяем фильтры если есть
    if (
      webhook.filters &&
      !this.matchesFilters(
        payload.data as Record<string, unknown> | null,
        webhook.filters as Record<string, unknown> | null
      )
    ) {
      logger.info(`Webhook ${webhook.id} skipped due to filters`);
      return;
    }

    // Retry logic
    while (attempt < webhook.retryCount && !success) {
      attempt++;

      try {
        const response = await axios({
          method: webhook.method as string,
          url: webhook.url,
          data: payload,
          headers: (webhook.headers as Record<string, string> | null) || {},
          timeout: 30000,
        });

        success = true;

        // Сохраняем успешное выполнение
        await this.saveExecution(context, {
          webhookId: webhook.id,
          event: event as unknown as WebhookEvent,
          payload: payload as Prisma.InputJsonValue,
          statusCode: response.status,
          response: response.data as Prisma.InputJsonValue,
          duration: Date.now() - startTime,
          attempt,
          success: true,
        });

        // Обновляем статистику webhook
        await context.prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggeredAt: new Date(),
            successCount: { increment: 1 },
          },
        });

        logger.info(`Webhook ${webhook.id} executed successfully (attempt ${attempt})`);
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
        logger.error(`Webhook ${webhook.id} failed (attempt ${attempt}):`, getErrorMessage(error));

        // Если не последняя попытка - ждём перед retry
        if (attempt < webhook.retryCount) {
          await this.sleep(webhook.retryDelay * 1000);
        }
      }
    }

    // Если все попытки провалились
    if (!success && lastError) {
      const statusCode = lastError instanceof Error && 'response' in lastError
        ? (lastError as Record<string, unknown>).response && typeof (lastError as Record<string, unknown>).response === 'object'
          ? ((lastError as Record<string, unknown>).response as Record<string, unknown>).status ?? null
          : null
        : null;

      await this.saveExecution(context, {
        webhookId: webhook.id,
        event: event as unknown as WebhookEvent,
        payload: payload as Prisma.InputJsonValue,
        statusCode: statusCode as number | null,
        error: lastError.message,
        duration: Date.now() - startTime,
        attempt,
        success: false,
      });

      // Обновляем статистику
      await context.prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          failureCount: { increment: 1 },
        },
      });

      // Если слишком много ошибок - деактивируем webhook
      const updatedWebhook = await context.prisma.webhook.findUnique({
        where: { id: webhook.id },
      });

      if (updatedWebhook && updatedWebhook.failureCount > 10) {
        await context.prisma.webhook.update({
          where: { id: webhook.id },
          data: { status: "FAILED" },
        });
        logger.warn(`Webhook ${webhook.id} deactivated due to too many failures`);
      }
    }
  }

  /**
   * Сохраняет результат выполнения
   */
  private async saveExecution(
    context: WebhookContext,
    data: {
      webhookId: number;
      event: WebhookEvent;
      payload: Prisma.InputJsonValue;
      statusCode?: number | null;
      response?: Prisma.InputJsonValue;
      error?: string | null;
      duration?: number;
      attempt: number;
      success: boolean;
    }
  ) {
    const { webhookId, ...rest } = data;
    await context.prisma.webhookExecution.create({
      data: {
        ...rest,
        webhook: { connect: { id: webhookId } },
      },
    });
  }

  /**
   * Проверяет совпадение с фильтрами
   */
  private matchesFilters(
    data: Record<string, unknown> | unknown,
    filters: Record<string, unknown> | null
  ): boolean {
    if (!filters || typeof filters !== 'object') {
      return true;
    }

    if (typeof data !== 'object' || data === null) {
      return false;
    }

    for (const [key, value] of Object.entries(filters)) {
      if ((data as Record<string, unknown>)[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Вспомогательная функция для задержки
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Создаёт отложенный webhook (для напоминаний)
   */
  async scheduleWebhook(
    context: WebhookContext,
    params: {
      webhookId: number;
      resourceType: string;
      resourceId: number;
      scheduledFor: Date;
      event: string;
      payload: Record<string, unknown>;
    }
  ): Promise<ScheduledWebhook> {
    const { webhookId, ...rest } = params;
    return await context.prisma.scheduledWebhook.create({
      data: {
        ...rest,
        event: params.event as unknown as WebhookEvent,
        payload: params.payload as Prisma.InputJsonValue,
        webhook: { connect: { id: webhookId } },
      },
    });
  }

  /**
   * Выполняет все запланированные webhooks
   * (вызывается по cron каждую минуту)
   */
  async executeScheduledWebhooks(context: WebhookContext): Promise<void> {
    const now = new Date();

    // Находим все невыполненные webhooks которые пора запустить
    const scheduled = await context.prisma.scheduledWebhook.findMany({
      where: {
        executed: false,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        webhook: true,
      },
    });

    logger.info(`Found ${scheduled.length} scheduled webhooks to execute`);

    for (const item of scheduled) {
      try {
        const payload = typeof item.payload === 'object' && item.payload !== null
          ? (item.payload as Record<string, unknown>)
          : {};

        await this.executeWebhook(
          context,
          item.webhook,
          item.event,
          payload
        );

        // Помечаем как выполненный
        await context.prisma.scheduledWebhook.update({
          where: { id: item.id },
          data: {
            executed: true,
            executedAt: new Date(),
          },
        });
      } catch (error: unknown) {
        logger.error(`Failed to execute scheduled webhook ${item.id}:`, getErrorMessage(error));
      }
    }
  }

  /**
   * Создаёт webhooks для напоминаний о событии
   */
  async createEventReminders(
    context: WebhookContext,
    params: {
      userId: number;
      eventId: number;
      eventData: Record<string, unknown>;
    }
  ): Promise<void> {
    const { userId, eventId, eventData } = params;

    // Находим все webhooks пользователя с reminder событиями
    const webhooks = await context.prisma.webhook.findMany({
      where: {
        userId,
        status: "ACTIVE",
        OR: [
          { events: { has: "EVENT_REMINDER_1H" } },
          { events: { has: "EVENT_REMINDER_1D" } },
        ],
      },
    });

    const eventStart = new Date(eventData.startDate as string);

    for (const webhook of webhooks) {
      // Напоминание за 1 час
      if (webhook.events.includes("EVENT_REMINDER_1H")) {
        const reminderTime = new Date(eventStart.getTime() - 60 * 60 * 1000);
        if (reminderTime > new Date()) {
          await this.scheduleWebhook(context, {
            webhookId: webhook.id,
            resourceType: "EVENT",
            resourceId: eventId,
            scheduledFor: reminderTime,
            event: "EVENT_REMINDER_1H",
            payload: {
              event: "EVENT_REMINDER_1H",
              resourceType: "EVENT",
              resourceId: eventId,
              data: eventData,
              reminderType: "1_hour_before",
            },
          });
        }
      }

      // Напоминание за 1 день
      if (webhook.events.includes("EVENT_REMINDER_1D")) {
        const reminderTime = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000);
        if (reminderTime > new Date()) {
          await this.scheduleWebhook(context, {
            webhookId: webhook.id,
            resourceType: "EVENT",
            resourceId: eventId,
            scheduledFor: reminderTime,
            event: "EVENT_REMINDER_1D",
            payload: {
              event: "EVENT_REMINDER_1D",
              resourceType: "EVENT",
              resourceId: eventId,
              data: eventData,
              reminderType: "1_day_before",
            },
          });
        }
      }
    }
  }
}

export const WebhookService = new WebhookServiceClass();
