import { Context, Next } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import { logger } from "./logger.js";

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

function getClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  const realIp = c.req.header('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp.trim();
  try {
    const info = getConnInfo(c);
    const addr = info?.remote?.address;
    if (addr) return addr;
  } catch {
    // getConnInfo может быть недоступен (например, при запуске через Bun)
  }
  return 'unknown';
}

export const rateLimiter = async (c: Context, next: Next) => {
  const ip = getClientIp(c);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  const record = requests.get(ip);

  if (!record || now > record.resetTime) {
    requests.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return next();
  }

  if (record.count >= maxRequests) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    return c.json({ error: 'Too many requests' }, 429);
  }

  record.count++;
  return next();
};
