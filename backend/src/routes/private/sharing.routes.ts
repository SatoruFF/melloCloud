import { Router } from "express";
import { SharingController } from "../../controllers/sharingController.js";

const router: Router = Router();

// Share resource
router.post("/share", SharingController.shareResource);

router.post("/", SharingController.shareResource);

// Get permissions for resource
router.get("/permissions/:resourceType/:resourceId", SharingController.getResourcePermissions);

// Update permission
router.patch("/permissions/:permissionId", SharingController.updatePermission);

// Revoke permission
router.delete("/permissions/:permissionId", SharingController.revokePermission);

// Public links
router.post("/public-link", SharingController.createPublicLink);
router.delete("/public-link/:resourceType/:resourceId", SharingController.deletePublicLink);

// Get shared resources
router.get("/shared-with-me", SharingController.getSharedWithMe);
router.get("/shared-by-me", SharingController.getSharedByMe);

// Check permission
router.get("/check-permission/:resourceType/:resourceId", SharingController.checkPermission);

// Activity log
router.get("/activity/:resourceType/:resourceId", SharingController.getSharingActivity);

export default router;
