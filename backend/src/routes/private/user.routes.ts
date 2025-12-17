import { Router } from "express";
import { check } from "express-validator";
import { UserController } from "../../controllers/userController.js";

const router: Router = Router();

// ========================================
// AUTH ROUTES (требуют авторизации)
// ========================================

router.get("/auth", UserController.auth);
router.get("/refresh", UserController.refresh); // refresh НЕ требуе
router.post("/logout", UserController.logout);
router.post("/logout-all", UserController.logoutAll); // НОВОЕ - выйти со всех устройств

// ========================================
// SESSION MANAGEMENT (требуют авторизации)
// ========================================

router.get("/sessions", UserController.getSessions);
router.delete("/sessions/:sessionId", UserController.deleteSession);

// ========================================
// USER ROUTES (требуют авторизации)
// ========================================

router.patch("/changeinfo", [check("email", "Incorrect email").isEmail()], UserController.changeInfo);

router.get("/search", UserController.search);
router.get("/:id", UserController.getById);

export default router;
