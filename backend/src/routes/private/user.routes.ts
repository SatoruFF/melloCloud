import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { UserController } from "../../controllers/userController.js";

const router = new Hono();

// ========================================
// SCHEMAS
// ========================================

const changeInfoSchema = z.object({
  email: z.string().email("Incorrect email").optional(),
  userName: z.string().min(1, "User name cannot be empty").optional(),
});

// ========================================
// AUTH ROUTES (требуют авторизации)
// ========================================

router.get("/auth", (c) => UserController.auth(c));
router.get("/refresh", (c) => UserController.refresh(c));
router.post("/logout", (c) => UserController.logout(c));
router.post("/logout-all", (c) => UserController.logoutAll(c)); // НОВОЕ - выйти со всех устройств

// ========================================
// SESSION MANAGEMENT (требуют авторизации)
// ========================================

router.get("/sessions", (c) => UserController.getSessions(c));
router.delete("/sessions/:sessionId", (c) => UserController.deleteSession(c));

// ========================================
// USER ROUTES (требуют авторизации)
// ========================================

router.patch("/changeinfo", zValidator("json", changeInfoSchema), (c) => UserController.changeInfo(c));

router.get("/search", (c) => UserController.search(c));
router.get("/:id", (c) => UserController.getById(c));

export default router;
