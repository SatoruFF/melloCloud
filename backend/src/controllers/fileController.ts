// base
import type { Context } from "hono";

// services
import { prisma } from "../configs/config.js";
import { Avatar } from "../helpers/avatar.js";
import { FileService } from "../services/fileService.js";

import { PassThrough } from "stream";
import createError from "http-errors";
// Utils
import _ from "lodash";
import { logger } from "../configs/logger.js";
import "dotenv/config.js";

const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageGuid: true },
  });

  if (!user?.storageGuid) {
    throw createError(500, "Storage GUID not found for user");
  }

  return user;
};

class FileControllerClass {
  /**
   * Creates a new directory for the user.
   */
  async createDir(c: Context) {
    try {
      const {
        name,
        type,
        parent: parentId,
      } = await c.req.json<{
        name: string;
        type: string;
        parent?: number | null;
      }>();
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      const doubledFolder = await prisma.file.findFirst({
        where: { name, parentId },
      });

      if (!_.isEmpty(doubledFolder)) {
        throw createError(400, "Folder name is not unique!");
      }

      const user = await getUserById(userId);

      const fileInstance = {
        name,
        type,
        parentId: parentId ?? null,
        userId,
        path: "",
        url: "",
      };

      if (parentId == null) {
        fileInstance.path = name;
      } else {
        const parentFile = await prisma.file.findFirst({
          where: { id: parentId, userId },
        });

        if (_.isEmpty(parentFile)) {
          throw createError(400, "Parent directory not found");
        }

        fileInstance.path = `${parentFile.path}/${name}`;
      }

      const file = await prisma.file.create({
        data: fileInstance,
      });

      const itemUrl = await FileService.createDir({
        ...fileInstance,
        storageGuid: user.storageGuid,
      });

      const updatedFile = await prisma.file.update({
        where: { id: file.id },
        data: { url: itemUrl },
      });

      return c.json(updatedFile);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Retrieves files for the user based on sort, search, and parent folder.
   */
  async getFiles(c: Context) {
    try {
      const query = c.req.query();
      const sort = query.sort;
      const search = query.search;
      const limit = query.limit;
      const offset = query.offset;
      const parentId = query.parent ? Number.parseInt(query.parent as string) : null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      const user = await getUserById(userId);

      const searchParams = {
        storageGuid: user?.storageGuid,
        sort,
        limit: limit != null ? Number(limit) : undefined,
        offset: offset != null ? Number(offset) : undefined,
        search,
        parentId: parentId ?? undefined,
        userId,
      };

      const files = await FileService.getFiles(searchParams);

      return c.json(files);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Returns a signed URL for file preview (e.g. for double-click preview in UI).
   */
  async getFilePreviewUrl(c: Context) {
    try {
      const fileId = Number(c.req.query("id"));
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) {
        throw createError(401, "User not found");
      }
      if (Number.isNaN(fileId)) {
        throw createError(400, "Invalid file id");
      }
      const url = await FileService.getFilePreviewUrl(fileId, userId);
      return c.json({ url });
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Uploads a file for the user to the storage.
   * Hono: ожидает multipart/form-data и использует parseBody()
   */
  async uploadFile(c: Context) {
    try {
      const body = await c.req.parseBody();
      const file = body.file as { name?: string; type?: string; size?: number; arrayBuffer(): Promise<ArrayBuffer> } | undefined;
      const parentId = body.parent as string | undefined;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!file) {
        throw createError(400, "File is required");
      }

      const fileForService = {
        name: file.name ?? "upload",
        type: file.type ?? "application/octet-stream",
        size: file.size ?? 0,
        arrayBuffer: () => file.arrayBuffer(),
      };
      const savedFile = await FileService.uploadFile(fileForService, userId, parentId);

      return c.json(savedFile);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Downloads a file for the user.
   */
  async downloadFile(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const queryId = c.req.query("id");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!queryId) {
        throw createError(400, "File id is required");
      }

      const user = await getUserById(userId);

      const { s3object, file } = await FileService.downloadFile(queryId, userId, user.storageGuid);

      const stream = new PassThrough();
      stream.end(s3object.Body as any);

      return c.newResponse(stream as any, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename=${file.name}`,
          "Content-Type": file.type,
        },
      });
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Returns file content for preview (no CORS: frontend fetches via API with auth).
   */
  async getFileContent(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const fileId = Number(c.req.query("id"));
      if (!userId) {
        throw createError(401, "User not found");
      }
      if (Number.isNaN(fileId)) {
        throw createError(400, "Invalid file id");
      }
      const user = await getUserById(userId);
      const { s3object, file } = await FileService.downloadFile(fileId, userId, user.storageGuid);
      const stream = new PassThrough();
      stream.end(s3object.Body as any);
      return c.newResponse(stream as any, {
        status: 200,
        headers: {
          "Content-Disposition": `inline; filename="${file.name}"`,
          "Content-Type": file.type || "application/octet-stream",
        },
      });
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Deletes a file for the user.
   */
  async deleteFile(c: Context) {
    try {
      const fileId = Number(c.req.query("id"));
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!fileId) {
        throw createError(400, "File id is required");
      }

      await getUserById(userId);

      const allFiles = await FileService.deleteFile(fileId, userId);

      return c.json(allFiles);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Uploads an avatar for the user.
   */
  async uploadAvatar(c: Context) {
    try {
      const body = await c.req.parseBody();
      const file = body.file as { arrayBuffer(): Promise<ArrayBuffer> } | undefined;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!file) {
        throw createError(400, "File is required");
      }

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const avatarUrl = await Avatar.uploadAvatar(fileBuffer, userId);

      return c.json(avatarUrl);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  /**
   * Deletes the user's avatar.
   */
  async deleteAvatar(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      const user = await Avatar.deleteAvatar(userId);

      return c.json(user);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const FileController = new FileControllerClass();
