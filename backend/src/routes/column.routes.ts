import { Router } from "express";
import { ColumnController } from "../controllers/taskColumn.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router: Router = Router();

// Basic CRUD operations
router.post("", authMiddleware, ColumnController.create);
router.get("", authMiddleware, ColumnController.getAll);
router.get("/:id", authMiddleware, ColumnController.getById);
router.put("/:id", authMiddleware, ColumnController.update);
router.delete("/:id", authMiddleware, ColumnController.delete);

// Additional column operations
router.patch("/reorder", authMiddleware, ColumnController.reorder);
router.patch("/move-task", authMiddleware, ColumnController.moveTask);
router.get("/stats", authMiddleware, ColumnController.getStats);

export default router;
