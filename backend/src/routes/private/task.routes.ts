import { Router } from "express";
import { TaskController } from "../../controllers/taskController.js";

const router: Router = Router();

// Basic CRUD operations
router.post("", TaskController.create);
router.get("", TaskController.getAll);
router.get("/kanban", TaskController.getKanban); // Get kanban board data
router.get("/stats", TaskController.getStats); // Get task statistics
router.get("/overdue", TaskController.getOverdue); // Get overdue tasks
router.get("/upcoming", TaskController.getUpcoming); // Get upcoming tasks
router.get("/search", TaskController.search); // Search tasks
router.get("/priority/:priority", TaskController.getByPriority);
router.get("/status/:status", TaskController.getByStatus);
router.get("/column/:columnId", TaskController.getByColumn); // Get tasks by column
router.get("/:id", TaskController.getById);

router.put("/:id", TaskController.update);
router.delete("/:id", TaskController.delete);

// Additional task operations
router.patch("/:id/toggle", TaskController.toggleComplete);
router.patch("/:id/move", TaskController.moveToColumn); // Move task to different column
router.patch("/batch-update", TaskController.batchUpdate); // Batch update for drag and drop

export default router;
