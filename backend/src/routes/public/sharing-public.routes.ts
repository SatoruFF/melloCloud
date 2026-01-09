import { Router } from "express";
import { SharingController } from "../../controllers/sharingController.js";

const router: Router = Router();

// Access public resource (no auth required)
router.get("/public/:token", SharingController.accessPublicResource);

// Access public resource (no auth required)
router.get("/:token", SharingController.accessPublicResource);

export default router;
