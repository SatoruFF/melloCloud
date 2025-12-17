import { Router } from "express";
import { ColumnController } from "../../controllers/taskColumn";

const router: Router = Router();

// Basic CRUD operations
router.post("", ColumnController.create);
router.get("", ColumnController.getAll);
router.get("/:id", ColumnController.getById);
router.put("/:id", ColumnController.update);
router.delete("/:id", ColumnController.delete);

// Additional column operations
router.patch("/reorder", ColumnController.reorder);
router.patch("/move-task", ColumnController.moveTask);
router.get("/stats", ColumnController.getStats);

export default router;
