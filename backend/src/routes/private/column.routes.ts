import { Hono } from "hono";
import { ColumnController } from "../../controllers/taskColumn.js";

const router = new Hono();

// Basic CRUD operations
router.post("/", (c) => ColumnController.create(c));
router.get("/", (c) => ColumnController.getAll(c));
router.get("/:id", (c) => ColumnController.getById(c));
router.put("/:id", (c) => ColumnController.update(c));
router.delete("/:id", (c) => ColumnController.delete(c));

// Additional column operations
router.patch("/reorder", (c) => ColumnController.reorder(c));
router.patch("/move-task", (c) => ColumnController.moveTask(c));
router.get("/stats", (c) => ColumnController.getStats(c));

export default router;
