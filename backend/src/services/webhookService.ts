import axios from "axios";
import createError from "http-errors";
import { logger } from "../configs/logger.js";

interface TriggerWebhookParams {
  event: string;
  resourceType: string;
  resourceId: number;
  data: any;
  userId: number;
}

class WebhookServiceClass {
  /**
   * Триггерит все подходящие webhooks для события
   */
  async triggerWebhooks(context: any, params: TriggerWebhookParams) {
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
  async executeWebhook(context: any, webhook: any, event: string, payload: any) {
    const startTime = Date.now();
    let attempt = 0;
    let success = false;
    let lastError = null;

    // Применяем фильтры если есть
    if (webhook.filters && !this.matchesFilters(payload.data, webhook.filters)) {
      logger.info(`Webhook ${webhook.id} skipped due to filters`);
      return;
    }

    // Retry logic
    while (attempt < webhook.retryCount && !success) {
      attempt++;

      try {
        const response = await axios({
          method: webhook.method,
          url: webhook.url,
          data: payload,
          headers: webhook.headers || {},
          timeout: 30000,
        });

        success = true;

        // Сохраняем успешное выполнение
        await this.saveExecution(context, {
          webhookId: webhook.id,
          event,
          payload,
          statusCode: response.status,
          response: response.data,
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
      } catch (error: any) {
        lastError = error;
        logger.error(`Webhook ${webhook.id} failed (attempt ${attempt}):`, error.message);

        // Если не последняя попытка - ждём перед retry
        if (attempt < webhook.retryCount) {
          await this.sleep(webhook.retryDelay * 1000);
        }
      }
    }

    // Если все попытки провалились
    if (!success && lastError) {
      await this.saveExecution(context, {
        webhookId: webhook.id,
        event,
        payload,
        statusCode: lastError.response?.status || null,
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
  private async saveExecution(context: any, data: any) {
    await context.prisma.webhookExecution.create({
      data,
    });
  }

  /**
   * Проверяет совпадение с фильтрами
   */
  private matchesFilters(data: any, filters: any): boolean {
    for (const [key, value] of Object.entries(filters)) {
      if (data[key] !== value) {
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
    context: any,
    params: {
      webhookId: number;
      resourceType: string;
      resourceId: number;
      scheduledFor: Date;
      event: string;
      payload: any;
    }
  ) {
    return await context.prisma.scheduledWebhook.create({
      data: params,
    });
  }

  /**
   * Выполняет все запланированные webhooks
   * (вызывается по cron каждую минуту)
   */
  async executeScheduledWebhooks(context: any) {
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
        await this.executeWebhook(context, item.webhook, item.event, item.payload);

        // Помечаем как выполненный
        await context.prisma.scheduledWebhook.update({
          where: { id: item.id },
          data: {
            executed: true,
            executedAt: new Date(),
          },
        });
      } catch (error: any) {
        logger.error(`Failed to execute scheduled webhook ${item.id}:`, error);
      }
    }
  }

  /**
   * Создаёт webhooks для напоминаний о событии
   */
  async createEventReminders(
    context: any,
    params: {
      userId: number;
      eventId: number;
      eventData: any;
    }
  ) {
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

    const eventStart = new Date(eventData.startDate);

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
