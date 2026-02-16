import { Hono } from "hono";
import { WebhookController } from "../../controllers/webhookController.js";

const router = new Hono();

// Get available events
router.get("/events", (c) => WebhookController.getAvailableEvents(c));

// Get all user webhooks
router.get("/", (c) => WebhookController.getUserWebhooks(c));

// Get scheduled webhooks
router.get("/scheduled", (c) => WebhookController.getScheduledWebhooks(c));

// Get single webhook
router.get("/:webhookId", (c) => WebhookController.getWebhook(c));

// Get webhook executions
router.get("/:webhookId/executions", (c) => WebhookController.getWebhookExecutions(c));

// Create webhook
router.post("/", (c) => WebhookController.createWebhook(c));

// Test webhook
router.post("/:webhookId/test", (c) => WebhookController.testWebhook(c));

// Update webhook
router.put("/:webhookId", (c) => WebhookController.updateWebhook(c));

// Delete webhook
router.delete("/:webhookId", (c) => WebhookController.deleteWebhook(c));

export default router;
