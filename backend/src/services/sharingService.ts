import { prisma, s3 } from "../configs/config.js";
import createError from "http-errors";
import { ResourceType, PermissionLevel, ShareActivityType } from "@prisma/client";
import crypto from "crypto";

interface ShareResourceData {
  resourceType: ResourceType;
  resourceId: number;
  email?: string;
  userId?: number;
  permissionLevel: PermissionLevel;
  expiresAt?: Date;
  grantedBy: number;
}

class SharingServiceClass {
  // Share resource with user or email
  async shareResource(data: ShareResourceData) {
    return prisma.$transaction(async (trx) => {
      const { resourceType, resourceId, email, userId, permissionLevel, expiresAt, grantedBy } = data;

      // Verify owner has permission to share
      const isOwner = await this.verifyOwnership(resourceType, resourceId, grantedBy, trx);
      if (!isOwner) {
        throw createError(403, "You don't have permission to share this resource");
      }

      // If email provided, check if user exists
      let targetUserId = userId;
      if (email && !userId) {
        const user = await trx.user.findUnique({ where: { email } });
        if (user) {
          targetUserId = user.id;
        }
      }

      // Check if permission already exists
      const existingPermission = await trx.permission.findFirst({
        where: {
          resourceType,
          resourceId,
          ...(targetUserId ? { subjectId: targetUserId } : { email }),
        },
      });

      if (existingPermission) {
        throw createError(400, "Permission already exists for this user/email");
      }

      // Create permission
      const permission = await trx.permission.create({
        data: {
          resourceType,
          resourceId,
          subjectId: targetUserId,
          email: !targetUserId ? email : undefined,
          permissionLevel,
          expiresAt,
          grantedBy,
        },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Log activity
      await trx.shareActivity.create({
        data: {
          actorId: grantedBy,
          targetId: targetUserId,
          targetEmail: email,
          resourceType,
          resourceId,
          activityType: ShareActivityType.SHARED,
          newPermission: permissionLevel,
        },
      });

      return permission;
    });
  }

  // Get all permissions for a resource
  async getResourcePermissions(resourceType: ResourceType, resourceId: number, userId: number) {
    // Verify user has access to view permissions
    const hasAccess = await this.verifyOwnership(resourceType, resourceId, userId);
    if (!hasAccess) {
      throw createError(403, "You don't have permission to view these permissions");
    }

    const permissions = await prisma.permission.findMany({
      where: {
        resourceType,
        resourceId,
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            avatar: true,
          },
        },
        grantedByUser: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return permissions;
  }

  // Update permission level
  async updatePermission(permissionId: number, permissionLevel: PermissionLevel, userId: number) {
    return prisma.$transaction(async (trx) => {
      // Get existing permission
      const existingPermission = await trx.permission.findUnique({
        where: { id: permissionId },
      });

      if (!existingPermission) {
        throw createError(404, "Permission not found");
      }

      // Verify user has permission to update
      const isOwner = await this.verifyOwnership(
        existingPermission.resourceType,
        existingPermission.resourceId,
        userId,
        trx
      );
      if (!isOwner) {
        throw createError(403, "You don't have permission to update this permission");
      }

      // Update permission
      const permission = await trx.permission.update({
        where: { id: permissionId },
        data: { permissionLevel },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Log activity
      await trx.shareActivity.create({
        data: {
          actorId: userId,
          targetId: existingPermission.subjectId,
          targetEmail: existingPermission.email,
          resourceType: existingPermission.resourceType,
          resourceId: existingPermission.resourceId,
          activityType: ShareActivityType.PERMISSION_CHANGED,
          oldPermission: existingPermission.permissionLevel,
          newPermission: permissionLevel,
        },
      });

      return permission;
    });
  }

  // Revoke permission
  async revokePermission(permissionId: number, userId: number) {
    return prisma.$transaction(async (trx) => {
      const permission = await trx.permission.findUnique({
        where: { id: permissionId },
      });

      if (!permission) {
        throw createError(404, "Permission not found");
      }

      // Verify user has permission to revoke
      const isOwner = await this.verifyOwnership(
        permission.resourceType,
        permission.resourceId,
        userId,
        trx
      );
      if (!isOwner) {
        throw createError(403, "You don't have permission to revoke this permission");
      }

      await trx.permission.delete({
        where: { id: permissionId },
      });

      // Log activity
      await trx.shareActivity.create({
        data: {
          actorId: userId,
          targetId: permission.subjectId,
          targetEmail: permission.email,
          resourceType: permission.resourceType,
          resourceId: permission.resourceId,
          activityType: ShareActivityType.PERMISSION_REVOKED,
          oldPermission: permission.permissionLevel,
        },
      });
    });
  }

  // Create public link
  async createPublicLink(
    resourceType: ResourceType,
    resourceId: number,
    permissionLevel: PermissionLevel,
    userId: number
  ) {
    return prisma.$transaction(async (trx) => {
      // Verify ownership
      const isOwner = await this.verifyOwnership(resourceType, resourceId, userId, trx);
      if (!isOwner) {
        throw createError(403, "You don't have permission to create public link");
      }

      // Check if public link already exists
      const existingLink = await trx.permission.findFirst({
        where: {
          resourceType,
          resourceId,
          isPublic: true,
        },
      });

      if (existingLink) {
        throw createError(400, "Public link already exists");
      }

      // Generate token
      const token = crypto.randomBytes(32).toString("hex");

      // Create public permission
      await trx.permission.create({
        data: {
          resourceType,
          resourceId,
          permissionLevel,
          isPublic: true,
          publicToken: token,
          grantedBy: userId,
        },
      });

      const url = `${process.env.FRONTEND_URL}/shared/${token}`;

      return { token, url };
    });
  }

  // Delete public link
  async deletePublicLink(resourceType: ResourceType, resourceId: number, userId: number) {
    return prisma.$transaction(async (trx) => {
      const isOwner = await this.verifyOwnership(resourceType, resourceId, userId, trx);
      if (!isOwner) {
        throw createError(403, "You don't have permission to delete public link");
      }

      await trx.permission.deleteMany({
        where: {
          resourceType,
          resourceId,
          isPublic: true,
        },
      });
    });
  }

  // Get resources shared with me
  async getSharedWithMe(userId: number, resourceType?: ResourceType) {
    const permissions = await prisma.permission.findMany({
      where: {
        subjectId: userId,
        ...(resourceType && { resourceType }),
      },
      include: {
        grantedByUser: {
          select: {
            id: true,
            userName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get actual resources
    const resources = await this.fetchResources(permissions);

    return resources;
  }

  // Get resources shared by me
  async getSharedByMe(userId: number, resourceType?: ResourceType) {
    const permissions = await prisma.permission.findMany({
      where: {
        grantedBy: userId,
        ...(resourceType && { resourceType }),
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const resources = await this.fetchResources(permissions);

    return resources;
  }

  // Check user permission
  async checkUserPermission(userId: number, resourceType: ResourceType, resourceId: number) {
    // Check if user is owner
    const isOwner = await this.verifyOwnership(resourceType, resourceId, userId);
    if (isOwner) {
      return { hasAccess: true, permissionLevel: PermissionLevel.OWNER };
    }

    // Check permissions
    const permission = await prisma.permission.findFirst({
      where: {
        resourceType,
        resourceId,
        subjectId: userId,
      },
    });

    if (!permission) {
      return { hasAccess: false, permissionLevel: null };
    }

    // Check expiration
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      return { hasAccess: false, permissionLevel: null, expired: true };
    }

    return { hasAccess: true, permissionLevel: permission.permissionLevel };
  }

  // Access public resource
  async accessPublicResource(token: string) {
    const permission = await prisma.permission.findUnique({
      where: { publicToken: token },
    });

    if (!permission || !permission.isPublic) {
      throw createError(404, "Public link not found");
    }

    // Check expiration
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      throw createError(403, "Public link has expired");
    }

    // Fetch the actual resource
    const resource = await this.fetchSingleResource(permission.resourceType, permission.resourceId);

    return { resource, permissionLevel: permission.permissionLevel };
  }

  // Get sharing activity
  async getSharingActivity(resourceType: ResourceType, resourceId: number, userId: number) {
    const isOwner = await this.verifyOwnership(resourceType, resourceId, userId);
    if (!isOwner) {
      throw createError(403, "You don't have permission to view activity");
    }

    const activities = await prisma.shareActivity.findMany({
      where: {
        resourceType,
        resourceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return activities;
  }

  // Helper: Verify ownership
  private async verifyOwnership(
    resourceType: ResourceType,
    resourceId: number,
    userId: number,
    trx?: any
  ): Promise<boolean> {
    const prismaClient = trx || prisma;

    switch (resourceType) {
      case ResourceType.NOTE:
        const note = await prismaClient.note.findFirst({
          where: { id: resourceId, userId },
        });
        return !!note;

      case ResourceType.TASK:
        const task = await prismaClient.task.findFirst({
          where: { id: resourceId, userId },
        });
        return !!task;

      case ResourceType.EVENT:
        const event = await prismaClient.calendarEvent.findFirst({
          where: { id: resourceId, userId },
        });
        return !!event;

      case ResourceType.FILE:
      case ResourceType.FOLDER:
        const file = await prismaClient.file.findFirst({
          where: { id: resourceId, userId },
        });
        return !!file;

      case ResourceType.COLUMN:
        const column = await prismaClient.taskColumn.findFirst({
          where: { id: resourceId, userId },
        });
        return !!column;

      default:
        return false;
    }
  }

  // Helper: Fetch resources
  private async fetchResources(permissions: any[]) {
    const resourcesByType: Record<string, number[]> = {};

    permissions.forEach((p) => {
      if (!resourcesByType[p.resourceType]) {
        resourcesByType[p.resourceType] = [];
      }
      resourcesByType[p.resourceType].push(p.resourceId);
    });

    const results = [];

    for (const [type, ids] of Object.entries(resourcesByType)) {
      const resources = await this.fetchResourcesByType(type as ResourceType, ids);
      resources.forEach((r) => {
        const permission = permissions.find((p) => p.resourceId === r.id && p.resourceType === type);
        results.push({
          ...r,
          resourceType: type,
          permission,
        });
      });
    }

    return results;
  }

  private async fetchResourcesByType(resourceType: ResourceType, ids: number[]) {
    switch (resourceType) {
      case ResourceType.NOTE:
        return await prisma.note.findMany({ where: { id: { in: ids } } });
      case ResourceType.TASK:
        return await prisma.task.findMany({ where: { id: { in: ids } }, include: { column: true } });
      case ResourceType.EVENT:
        return await prisma.calendarEvent.findMany({ where: { id: { in: ids } } });
      case ResourceType.FILE:
      case ResourceType.FOLDER:
        return await prisma.file.findMany({ where: { id: { in: ids } } });
      case ResourceType.COLUMN:
        return await prisma.taskColumn.findMany({ where: { id: { in: ids } }, include: { tasks: true } });
      default:
        return [];
    }
  }

  private async fetchSingleResource(resourceType: ResourceType, resourceId: number) {
    let resource: any = null;
    
    switch (resourceType) {
      case ResourceType.NOTE:
        resource = await prisma.note.findUnique({ where: { id: resourceId } });
        break;
      case ResourceType.TASK:
        resource = await prisma.task.findUnique({ where: { id: resourceId }, include: { column: true } });
        break;
      case ResourceType.EVENT:
        resource = await prisma.calendarEvent.findUnique({ where: { id: resourceId } });
        break;
      case ResourceType.FILE:
      case ResourceType.FOLDER:
        resource = await prisma.file.findUnique({ where: { id: resourceId } });
        break;
      case ResourceType.COLUMN:
        resource = await prisma.taskColumn.findUnique({ where: { id: resourceId }, include: { tasks: true } });
        break;
      default:
        return null;
    }
  
    if (resource) {
      return {
        ...resource,
        resourceType,
      };
    }
  
    return null;
  }

  // Download public file
  async downloadPublicFile(token: string) {
    const permission = await prisma.permission.findUnique({
      where: { publicToken: token },
    });

    if (!permission || !permission.isPublic) {
      throw createError(404, "Public link not found");
    }

    // Check expiration
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      throw createError(403, "Public link has expired");
    }

    // Only files can be downloaded
    if (permission.resourceType !== ResourceType.FILE) {
      throw createError(400, "Only files can be downloaded");
    }

    // Get file info
    const file: any = await prisma.file.findUnique({
      where: { id: permission.resourceId },
      include: {
        user: {
          select: {
            storageGuid: true,
          },
        },
      },
    });

    if (!file) {
      throw createError(404, "File not found");
    }

    let filePath = `${String(file.user.storageGuid)}/${file.path}/${file.name}`;
    filePath = filePath.replace(/\/{2,}/g, "/");

    const s3object = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath,
      })
      .promise();

    return { file, s3object };
  }
}

export const SharingService = new SharingServiceClass();
