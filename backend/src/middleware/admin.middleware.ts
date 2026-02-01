import type { Context, Next } from "hono";
import { getAdminUserIds } from "../configs/config.js";

/** Разрешает доступ только пользователям из ADMIN_USER_IDS. Вызывать после authMiddleware. */
export const adminMiddleware = async (c: Context, next: Next) => {
  const userId = c.get("userId") as number | undefined;
  if (userId == null || !Number.isFinite(userId)) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const adminIds = getAdminUserIds();
  if (!adminIds.includes(userId)) {
    return c.json({ message: "Forbidden: admin only" }, 403);
  }
  await next();
};

export default adminMiddleware;
