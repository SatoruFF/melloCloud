import type { Response, NextFunction } from "express";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { SharingService } from "../services/sharingService.js";
import { ResourceType, PermissionLevel } from "@prisma/client";

class SharingControllerClass {
  // Share resource with user
  async shareResource(req: any, res: Response, next: NextFunction) {
    try {
      const { resourceType, resourceId, email, userId, permissionLevel, expiresAt } = req.body;
      const grantedBy = req.user?.id;

      if (!grantedBy) {
        throw createError(401, "User not found");
      }

      if (!resourceType || !resourceId) {
        throw createError(400, "Resource type and ID are required");
      }

      if (!email && !userId) {
        throw createError(400, "Either email or userId is required");
      }

      const permission = await SharingService.shareResource({
        resourceType: resourceType as ResourceType,
        resourceId: Number(resourceId),
        email,
        userId: userId ? Number(userId) : undefined,
        permissionLevel: (permissionLevel as PermissionLevel) || PermissionLevel.VIEWER,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        grantedBy,
      });

      return res.json(permission);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get permissions for a resource
  async getResourcePermissions(req: any, res: Response) {
    try {
      const { resourceType, resourceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!resourceType || !resourceId) {
        throw createError(400, "Resource type and ID are required");
      }

      const permissions = await SharingService.getResourcePermissions(
        resourceType as ResourceType,
        Number(resourceId),
        userId
      );

      return res.json(permissions);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Update permission level
  async updatePermission(req: any, res: Response) {
    try {
      const { permissionId } = req.params;
      const { permissionLevel } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!permissionId || !permissionLevel) {
        throw createError(400, "Permission ID and level are required");
      }

      const permission = await SharingService.updatePermission(
        Number(permissionId),
        permissionLevel as PermissionLevel,
        userId
      );

      return res.json(permission);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Revoke permission
  async revokePermission(req: any, res: Response) {
    try {
      const { permissionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!permissionId) {
        throw createError(400, "Permission ID is required");
      }

      await SharingService.revokePermission(Number(permissionId), userId);

      return res.status(200).json({ message: "Permission revoked successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Create public link
  async createPublicLink(req: any, res: Response) {
    try {
      const { resourceType, resourceId, permissionLevel } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!resourceType || !resourceId) {
        throw createError(400, "Resource type and ID are required");
      }

      const { token, url } = await SharingService.createPublicLink(
        resourceType as ResourceType,
        Number(resourceId),
        (permissionLevel as PermissionLevel) || PermissionLevel.VIEWER,
        userId
      );

      return res.json({ token, url });
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Delete public link
  async deletePublicLink(req: any, res: Response) {
    try {
      const { resourceType, resourceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!resourceType || !resourceId) {
        throw createError(400, "Resource type and ID are required");
      }

      await SharingService.deletePublicLink(
        resourceType as ResourceType,
        Number(resourceId),
        userId
      );

      return res.status(200).json({ message: "Public link deleted successfully" });
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get shared with me
  async getSharedWithMe(req: any, res: Response) {
    try {
      const { type } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const resources = await SharingService.getSharedWithMe(
        userId,
        type as ResourceType | undefined
      );

      return res.json(resources);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get shared by me
  async getSharedByMe(req: any, res: Response) {
    try {
      const { type } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const resources = await SharingService.getSharedByMe(
        userId,
        type as ResourceType | undefined
      );

      return res.json(resources);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Check user permission
  async checkPermission(req: any, res: Response) {
    try {
      const { resourceType, resourceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!resourceType || !resourceId) {
        throw createError(400, "Resource type and ID are required");
      }

      const permission = await SharingService.checkUserPermission(
        userId,
        resourceType as ResourceType,
        Number(resourceId)
      );

      return res.json(permission);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Access public resource
  async accessPublicResource(req: any, res: Response) {
    try {
      const { token } = req.params;

      if (!token) {
        throw createError(400, "Token is required");
      }

      const resource = await SharingService.accessPublicResource(token);

      return res.json(resource);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get sharing activity
  async getSharingActivity(req: any, res: Response) {
    try {
      const { resourceType, resourceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!resourceType || !resourceId) {
        throw createError(400, "Resource type and ID are required");
      }

      const activities = await SharingService.getSharingActivity(
        resourceType as ResourceType,
        Number(resourceId),
        userId
      );

      return res.json(activities);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Download public file
  async downloadPublicFile(req: any, res: Response) {
    try {
      const { token } = req.params;

      if (!token) {
        throw createError(400, "Token is required");
      }

      const { file, s3object } = await SharingService.downloadPublicFile(token);

      // TODO: USE WITH FILE SERVICE NOT ANOTHER FN
      // ✅ Set headers
      res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
      res.setHeader("Content-Type", file.type || "application/octet-stream");
      res.setHeader("Content-Length", s3object.ContentLength);

      // ✅ Send S3 buffer
      res.send(s3object.Body);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const SharingController = new SharingControllerClass();
