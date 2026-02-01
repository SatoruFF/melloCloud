import { Hono } from "hono";
import { getFlagsForUser } from "../../services/featureFlagService.js";

const router = new Hono();

/** Флаги для текущего пользователя (глобальный isEnabled + per-user overrides). */
router.get("/", async (c) => {
  const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
  if (!userId) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const flags = await getFlagsForUser(userId);
  return c.json(flags);
});

export default router;
