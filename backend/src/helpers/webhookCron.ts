import cron from "node-cron";
import { prisma } from "../configs/config.js";
import { WebhookService } from "../services/webhookService.js";
import { logger } from "../configs/logger.js";

// Запускается каждую минуту
export const startWebhookCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      logger.info("Running scheduled webhooks check...");
      await WebhookService.executeScheduledWebhooks({ prisma });
    } catch (error: any) {
      logger.error("Webhook cron error:", error);
    }
  });

  logger.info("Webhook cron job started");
};
