import { Router } from "express";
import { TaskController } from "../controllers/taskController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router: Router = Router();

// Basic CRUD operations
router.post("", authMiddleware, TaskController.create);
router.get("", authMiddleware, TaskController.getAll);
router.get("/kanban", authMiddleware, TaskController.getKanban); // Get kanban board data
router.get("/stats", authMiddleware, TaskController.getStats); // Get task statistics
router.get("/overdue", authMiddleware, TaskController.getOverdue); // Get overdue tasks
router.get("/upcoming", authMiddleware, TaskController.getUpcoming); // Get upcoming tasks
router.get("/search", authMiddleware, TaskController.search); // Search tasks
router.get("/priority/:priority", authMiddleware, TaskController.getByPriority);
router.get("/status/:status", authMiddleware, TaskController.getByStatus);
router.get("/column/:columnId", authMiddleware, TaskController.getByColumn); // Get tasks by column
router.get("/:id", authMiddleware, TaskController.getById);

router.put("/:id", authMiddleware, TaskController.update);
router.delete("/:id", authMiddleware, TaskController.delete);

// Additional task operations
router.patch("/:id/toggle", authMiddleware, TaskController.toggleComplete);
router.patch("/:id/move", authMiddleware, TaskController.moveToColumn); // Move task to different column
router.patch("/batch-update", authMiddleware, TaskController.batchUpdate); // Batch update for drag and drop

export default router;
