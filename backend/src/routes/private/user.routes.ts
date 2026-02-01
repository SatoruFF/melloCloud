import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { UserController } from "../../controllers/userController.js";

const router = new Hono();

// ========================================
// SCHEMAS
// ========================================

const changeInfoSchema = z.object({
  userName: z.string().min(1, "User name cannot be empty").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
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
router.patch("/changepassword", zValidator("json", changePasswordSchema), (c) => UserController.changePassword(c));
router.delete("/account", zValidator("json", deleteAccountSchema), (c) => UserController.deleteAccount(c));

router.get("/search", (c) => UserController.search(c));
router.get("/:id", (c) => UserController.getById(c));

export default router;
