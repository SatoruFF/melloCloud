import type { Context } from "hono";
import createError from "http-errors";
import { Hono } from "hono";
import { ResourceType, PermissionLevel } from "@prisma/client";
import { logger } from "../../configs/logger.js";
import { SharingService } from "../../services/sharingService.js";

function getUserId(c: Context): number {
  const user = c.get("user") as { id?: number } | undefined;
  const userId = user?.id ?? c.get("userId");
  if (!userId) {
    throw createError(401, "User not found");
  }
  return userId as number;
}

const router = new Hono();

router.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      resourceType: string;
      resourceId: number;
      email?: string;
      userId?: number;
      permissionLevel?: string;
      expiresAt?: string;
    }>();
    const grantedBy = getUserId(c);
    if (!body.resourceType || body.resourceId == null) {
      throw createError(400, "Resource type and ID are required");
    }
    if (!body.email && !body.userId) {
      throw createError(400, "Either email or userId is required");
    }
    const permission = await SharingService.shareResource({
      resourceType: body.resourceType as ResourceType,
      resourceId: Number(body.resourceId),
      email: body.email,
      userId: body.userId ? Number(body.userId) : undefined,
      permissionLevel: (body.permissionLevel as PermissionLevel) || PermissionLevel.VIEWER,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      grantedBy,
    });
    return c.json(permission);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.get("/permissions/:resourceType/:resourceId", async (c) => {
  try {
    const resourceType = c.req.param("resourceType");
    const resourceId = c.req.param("resourceId");
    const userId = getUserId(c);
    if (!resourceType || !resourceId) {
      throw createError(400, "Resource type and ID are required");
    }
    const permissions = await SharingService.getResourcePermissions(
      resourceType as ResourceType,
      Number(resourceId),
      userId
    );
    return c.json(permissions);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.patch("/permissions/:permissionId", async (c) => {
  try {
    const permissionId = c.req.param("permissionId");
    const body = await c.req.json<{ permissionLevel: string }>();
    const userId = getUserId(c);
    if (!permissionId || !body.permissionLevel) {
      throw createError(400, "Permission ID and level are required");
    }
    const permission = await SharingService.updatePermission(
      Number(permissionId),
      body.permissionLevel as PermissionLevel,
      userId
    );
    return c.json(permission);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.delete("/permissions/:permissionId", async (c) => {
  try {
    const permissionId = c.req.param("permissionId");
    const userId = getUserId(c);
    if (!permissionId) {
      throw createError(400, "Permission ID is required");
    }
    await SharingService.revokePermission(Number(permissionId), userId);
    return c.json({ message: "Permission revoked successfully" }, 200);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.post("/public-link", async (c) => {
  try {
    const body = await c.req.json<{
      resourceType: string;
      resourceId: number;
      permissionLevel?: string;
    }>();
    const userId = getUserId(c);
    if (!body.resourceType || body.resourceId == null) {
      throw createError(400, "Resource type and ID are required");
    }
    const { token, url } = await SharingService.createPublicLink(
      body.resourceType as ResourceType,
      Number(body.resourceId),
      (body.permissionLevel as PermissionLevel) || PermissionLevel.VIEWER,
      userId
    );
    return c.json({ token, url });
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.delete("/public-link/:resourceType/:resourceId", async (c) => {
  try {
    const resourceType = c.req.param("resourceType");
    const resourceId = c.req.param("resourceId");
    const userId = getUserId(c);
    if (!resourceType || !resourceId) {
      throw createError(400, "Resource type and ID are required");
    }
    await SharingService.deletePublicLink(
      resourceType as ResourceType,
      Number(resourceId),
      userId
    );
    return c.json({ message: "Public link deleted successfully" }, 200);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.get("/shared-with-me", async (c) => {
  try {
    const type = c.req.query("type");
    const userId = getUserId(c);
    const resources = await SharingService.getSharedWithMe(
      userId,
      type as ResourceType | undefined
    );
    return c.json(resources);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.get("/shared-by-me", async (c) => {
  try {
    const type = c.req.query("type");
    const userId = getUserId(c);
    const resources = await SharingService.getSharedByMe(
      userId,
      type as ResourceType | undefined
    );
    return c.json(resources);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.get("/check-permission/:resourceType/:resourceId", async (c) => {
  try {
    const resourceType = c.req.param("resourceType");
    const resourceId = c.req.param("resourceId");
    const userId = getUserId(c);
    if (!resourceType || !resourceId) {
      throw createError(400, "Resource type and ID are required");
    }
    const permission = await SharingService.checkUserPermission(
      userId,
      resourceType as ResourceType,
      Number(resourceId)
    );
    return c.json(permission);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

router.get("/activity/:resourceType/:resourceId", async (c) => {
  try {
    const resourceType = c.req.param("resourceType");
    const resourceId = c.req.param("resourceId");
    const userId = getUserId(c);
    if (!resourceType || !resourceId) {
      throw createError(400, "Resource type and ID are required");
    }
    const activities = await SharingService.getSharingActivity(
      resourceType as ResourceType,
      Number(resourceId),
      userId
    );
    return c.json(activities);
  } catch (error: any) {
    logger.error(error.message, error);
    return c.json({ message: error.message }, error.statusCode || 500);
  }
});

export default router;
