import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import ApiContext from '../models/context';

export const authMiddleware = async (c: Context, next: Next) => {
  // OPTIONS requests skip auth
  if (c.req.method === 'OPTIONS') {
    return await next();
  }

  try {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return c.json({ message: 'Auth error with token' }, 401);
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY as string) as
      | { payload?: number | string; id?: number }
      | number;

    // Extract user ID (только число; токен приглашения имеет payload = email — не подходит для auth)
    const rawId =
      typeof decoded === "object" && decoded !== null
        ? (decoded.payload ?? decoded.id)
        : decoded;
    const id = typeof rawId === "number" && Number.isFinite(rawId) ? rawId : Number(rawId);
    if (!Number.isFinite(id) || id < 1) {
      return c.json({ message: "Invalid token" }, 401);
    }

    // Сохраняем в контекст Hono (аналог req.user)
    c.set("user", { id, ...(typeof decoded === "object" && decoded !== null ? decoded : {}) });
    
    // Создаём ApiContext
    c.set('context', new ApiContext(id));
    c.set('userId', id); // Для быстрого доступа

    await next();
  } catch (e: any) {
    return c.json({ message: 'Auth error', error: e.message }, 401);
  }
};

export default authMiddleware;
