import Stripe from "stripe";
import createError from "http-errors";
import { prisma } from "../configs/config.js";
import { getPublicConfig, getStorageBytesForPlan, getConfig } from "./subscriptionService.js";
import { CLIENT_URL } from "../configs/config.js";

// ============================================================
// Stripe
// ============================================================

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw createError(500, "Stripe not configured");
  return new Stripe(key, { apiVersion: "2025-05-28.basil" });
}

export async function createStripeSession(
  userId: number,
  plan: "PRO" | "ENTERPRISE",
  periodMonths: number,
  currency: "usd" | "rub" = "usd"
) {
  const cfg = await getPublicConfig();
  const priceUsd = plan === "PRO" ? cfg.proPriceUsd : cfg.enterprisePriceUsd;
  const priceRub = plan === "PRO" ? cfg.proPriceRub : cfg.enterprisePriceRub;

  const amount = currency === "usd"
    ? Math.round(priceUsd * periodMonths * 100)   // cents
    : Math.round(priceRub * periodMonths * 100);   // kopecks

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          product_data: { name: `melloCloud ${plan} — ${periodMonths} month${periodMonths > 1 ? "s" : ""}` },
          unit_amount: amount,
        },
      },
    ],
    success_url: `${CLIENT_URL}/subscription?payment=success&provider=stripe`,
    cancel_url: `${CLIENT_URL}/subscription?payment=cancel`,
    metadata: { userId: String(userId), plan, periodMonths: String(periodMonths), currency },
  });

  // Store pending payment
  await prisma.payment.create({
    data: {
      userId,
      plan,
      provider: "stripe",
      providerPaymentId: session.id,
      status: "pending",
      amountUsd: currency === "usd" ? priceUsd * periodMonths : null,
      amountRub: currency === "rub" ? priceRub * periodMonths : null,
      currency,
      periodMonths,
    },
  });

  return { url: session.url };
}

export async function handleStripeWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw createError(500, "Stripe webhook secret not configured");

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    throw createError(400, "Invalid Stripe webhook signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, plan, periodMonths } = session.metadata ?? {};
    if (!userId || !plan || !periodMonths) return;

    await activateSubscription(
      Number(userId),
      plan as "PRO" | "ENTERPRISE",
      Number(periodMonths),
      session.id
    );
  }
}

// ============================================================
// YooKassa
// ============================================================

const YOOKASSA_API = "https://api.yookassa.ru/v3";

function yooHeaders() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) throw createError(500, "YooKassa not configured");
  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
    "Idempotence-Key": `${Date.now()}-${Math.random()}`,
  };
}

export async function createYooKassaPayment(
  userId: number,
  plan: "PRO" | "ENTERPRISE",
  periodMonths: number
) {
  const cfg = await getPublicConfig();
  const priceRub = plan === "PRO" ? cfg.proPriceRub : cfg.enterprisePriceRub;
  const amount = (priceRub * periodMonths).toFixed(2);

  const body = {
    amount: { value: amount, currency: "RUB" },
    confirmation: {
      type: "redirect",
      return_url: `${CLIENT_URL}/subscription?payment=success&provider=yookassa`,
    },
    capture: true,
    description: `melloCloud ${plan} — ${periodMonths} month${periodMonths > 1 ? "s" : ""}`,
    metadata: { userId: String(userId), plan, periodMonths: String(periodMonths) },
  };

  const res = await fetch(`${YOOKASSA_API}/payments`, {
    method: "POST",
    headers: yooHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw createError(502, `YooKassa error: ${err}`);
  }
  const data = (await res.json()) as { id: string; confirmation: { confirmation_url: string } };

  await prisma.payment.create({
    data: {
      userId,
      plan,
      provider: "yookassa",
      providerPaymentId: data.id,
      status: "pending",
      amountRub: priceRub * periodMonths,
      currency: "RUB",
      periodMonths,
    },
  });

  return { url: data.confirmation.confirmation_url };
}

export async function handleYooKassaWebhook(payload: Record<string, unknown>) {
  const event = payload.event as string;
  if (event !== "payment.succeeded") return;

  const obj = payload.object as { id: string; metadata: { userId: string; plan: string; periodMonths: string } };
  const { userId, plan, periodMonths } = obj.metadata ?? {};
  if (!userId || !plan || !periodMonths) return;

  await activateSubscription(
    Number(userId),
    plan as "PRO" | "ENTERPRISE",
    Number(periodMonths),
    obj.id
  );
}

// ============================================================
// Activation (shared between providers)
// ============================================================

export async function activateSubscription(
  userId: number,
  plan: "PRO" | "ENTERPRISE",
  periodMonths: number,
  providerPaymentId: string
) {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + periodMonths);

  const storageBytes = await getStorageBytesForPlan(plan);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionExpiresAt: expiresAt,
        diskSpace: storageBytes,
      },
    }),
    prisma.payment.updateMany({
      where: { providerPaymentId, userId },
      data: { status: "succeeded", expiresAt },
    }),
  ]);
}

// ============================================================
// Payment history
// ============================================================

export async function getPaymentHistory(userId: number) {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      plan: true,
      provider: true,
      status: true,
      amountUsd: true,
      amountRub: true,
      currency: true,
      periodMonths: true,
      expiresAt: true,
      createdAt: true,
    },
  });
  return payments.map((p) => ({
    ...p,
    amountUsd: p.amountUsd !== null ? Number(p.amountUsd) : null,
    amountRub: p.amountRub !== null ? Number(p.amountRub) : null,
  }));
}
