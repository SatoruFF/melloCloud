import { Hono } from "hono";
import { getFlagsForUser } from "../../services/featureFlagService.js";

const router = new Hono();

/** Флаги для текущего пользователя (глобальный isEnabled + per-user overrides). */
router.get("/", async (c) => {
  const user = (c as { get: (k: string) => unknown }).get("user") as { id?: number } | undefined;
  const userId = user?.id ?? ((c as { get: (k: string) => unknown }).get("userId") as number | undefined);
  if (userId == null || typeof userId !== "number") {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const flags = await getFlagsForUser(userId);
  return c.json(flags);
});

export default router;
