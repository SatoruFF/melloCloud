import { Hono } from "hono";
import { BoardController } from "../../controllers/boardController.js";

const router = new Hono();

router.post("/", (c) => BoardController.create(c));
router.get("/", (c) => BoardController.getAll(c));
router.get("/:id", (c) => BoardController.getById(c));
router.put("/:id", (c) => BoardController.update(c));
router.delete("/:id", (c) => BoardController.delete(c));

export default router;
