import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as PaymentService from "../../services/paymentService.js";
import * as SubscriptionService from "../../services/subscriptionService.js";

const paymentRouter = new Hono();

// ── GET /payment/config  (public plan info for logged-in users) ──────────────
paymentRouter.get("/config", async (c) => {
  const cfg = await SubscriptionService.getPublicConfig();
  return c.json(cfg);
});

// ── GET /payment/history ──────────────────────────────────────────────────────
paymentRouter.get("/history", async (c) => {
  const userId = (c as unknown as { get(k: string): unknown }).get("userId") as number;
  const history = await PaymentService.getPaymentHistory(userId);
  return c.json(history);
});

// ── POST /payment/stripe ──────────────────────────────────────────────────────
const stripeSchema = z.object({
  plan: z.enum(["PRO", "ENTERPRISE"]),
  periodMonths: z.number().int().min(1).max(12).default(1),
  currency: z.enum(["usd", "rub"]).default("usd"),
});

paymentRouter.post("/stripe", zValidator("json", stripeSchema), async (c) => {
  const userId = (c as unknown as { get(k: string): unknown }).get("userId") as number;
  const { plan, periodMonths, currency } = c.req.valid("json");
  const result = await PaymentService.createStripeSession(userId, plan, periodMonths, currency);
  return c.json(result);
});

// ── POST /payment/yookassa ────────────────────────────────────────────────────
const yooSchema = z.object({
  plan: z.enum(["PRO", "ENTERPRISE"]),
  periodMonths: z.number().int().min(1).max(12).default(1),
});

paymentRouter.post("/yookassa", zValidator("json", yooSchema), async (c) => {
  const userId = (c as unknown as { get(k: string): unknown }).get("userId") as number;
  const { plan, periodMonths } = c.req.valid("json");
  const result = await PaymentService.createYooKassaPayment(userId, plan, periodMonths);
  return c.json(result);
});

export default paymentRouter;
