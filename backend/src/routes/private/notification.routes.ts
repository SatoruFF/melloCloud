import { Hono } from "hono";
import { NotificationController } from "../../controllers/notificationController.js";

const router = new Hono();

router.get("/", (c) => NotificationController.getAll(c));
router.get("/unread-count", (c) => NotificationController.getUnreadCount(c));
router.patch("/read-all", (c) => NotificationController.markAllAsRead(c));
router.patch("/:id/read", (c) => NotificationController.markAsRead(c));
router.delete("/", (c) => NotificationController.clearAll(c));
router.delete("/:id", (c) => NotificationController.remove(c));

export default router;
