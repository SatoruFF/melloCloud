import { Router } from "express";
import { TaskController } from "../controllers/taskController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router: Router = Router();

// Basic CRUD operations
router.post("", authMiddleware, TaskController.create);
router.get("", authMiddleware, TaskController.getAll);
router.get("/:id", authMiddleware, TaskController.getById);
router.put("/:id", authMiddleware, TaskController.update);
router.delete("/:id", authMiddleware, TaskController.delete);

// Additional task operations
router.patch("/:id/toggle", authMiddleware, TaskController.toggleComplete);
router.get("/search", authMiddleware, TaskController.search);
router.get("/priority/:priority", authMiddleware, TaskController.getByPriority);
router.get("/status/:status", authMiddleware, TaskController.getByStatus);

export default router;
