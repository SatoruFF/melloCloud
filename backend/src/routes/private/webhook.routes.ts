import { Router } from "express";
import { WebhookController } from "../../controllers/webhookController";

const router = Router();

// Get available events
router.get("/events", WebhookController.getAvailableEvents);

// Get all user webhooks
router.get("/", WebhookController.getUserWebhooks);

// Get scheduled webhooks
router.get("/scheduled", WebhookController.getScheduledWebhooks);

// Get single webhook
router.get("/:webhookId", WebhookController.getWebhook);

// Get webhook executions
router.get("/:webhookId/executions", WebhookController.getWebhookExecutions);

// Create webhook
router.post("/", WebhookController.createWebhook);

// Test webhook
router.post("/:webhookId/test", WebhookController.testWebhook);

// Update webhook
router.put("/:webhookId", WebhookController.updateWebhook);

// Delete webhook
router.delete("/:webhookId", WebhookController.deleteWebhook);

export default router;
