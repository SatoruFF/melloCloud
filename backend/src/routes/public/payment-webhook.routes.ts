/**
 * Public webhook endpoints — no auth middleware, but each verifies its own signature.
 * Stripe: uses HMAC signature header
 * YooKassa: IP filtering is done on infra level (nginx), payload is trusted
 */
import { Hono } from "hono";
import * as PaymentService from "../../services/paymentService.js";

const webhookRouter = new Hono();

// ── POST /webhooks/stripe ─────────────────────────────────────────────────────
webhookRouter.post("/stripe", async (c) => {
  const signature = c.req.header("stripe-signature");
  if (!signature) return c.json({ error: "Missing signature" }, 400);

  const rawBody = await c.req.text();
  try {
    await PaymentService.handleStripeWebhook(rawBody, signature);
    return c.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return c.json({ error: message }, 400);
  }
});

// ── POST /webhooks/yookassa ───────────────────────────────────────────────────
webhookRouter.post("/yookassa", async (c) => {
  const body = await c.req.json() as Record<string, unknown>;
  try {
    await PaymentService.handleYooKassaWebhook(body);
    return c.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return c.json({ error: message }, 400);
  }
});

export default webhookRouter;
