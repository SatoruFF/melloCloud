import { Router } from "express";
import { check } from "express-validator";
import { UserController } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router: Router = Router();

// AUTH ROUTES
router.post("/register", UserController.registration);

router.post("/login", UserController.login);

router.get("/auth", authMiddleware, UserController.auth);

router.get("/refresh", authMiddleware, UserController.refresh);

router.post("/logout", authMiddleware, UserController.logout);

router.get("/activate", UserController.activate);

// ANOTHER ROUTES

router.patch("/changeinfo", [check("email", "Uncorrect email").isEmail()], authMiddleware, UserController.changeInfo);

router.get("/search", authMiddleware, UserController.search);

router.get("/:id", authMiddleware, UserController.getById);

// router.get('/activate/:link', UserController.activate)

export default router;
