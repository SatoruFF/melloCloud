import { Context, Next } from 'hono';
import { logger } from '../configs/logger';

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = async (c: Context, next: Next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
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
