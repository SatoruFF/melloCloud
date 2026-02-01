import createError from "http-errors";
import _ from "lodash";
import type { Prisma } from "@prisma/client";
import { FETCH_LIMIT, prisma, s3, S3_BUCKET_NAME } from "../configs/config.js";
import type { IFile, ISearchParams } from "./../types/File";
import { NotificationService } from "./notificationService.js";

interface CreateDirResponse {
  message: string;
}

interface DeleteFileResponse {
  message: string;
}

interface IS3 {
  Bucket: string | undefined;
  Body?: any;
  Key?: string;
  Prefix?: string;
  Delete?: any;
}

type ExtendedFile = IFile & { storageGuid: string };

class FileServiceClass {
  // create dir or file
  async createDir(file: ExtendedFile): Promise<string> {
    let folderPath = `${file.storageGuid}/${file.path}`;

    if (!folderPath.endsWith("/")) {
      folderPath += "/";
    }

    const params: IS3 = {
      Bucket: S3_BUCKET_NAME,
      Key: folderPath,
      Body: "",
    };

    const getParams: IS3 = {
      Bucket: S3_BUCKET_NAME,
      Key: folderPath,
    };

    await s3.putObject(params as any).promise();

    const newDirUrl = await s3.getSignedUrl("getObject", getParams);

    return newDirUrl;
  }

  // delete file or directory
  async deleteBucketFile(file: ExtendedFile): Promise<DeleteFileResponse> {
    if (file.type === "dir") {
      let filePath = `${String(file.storageGuid)}/${file.path}`;

      filePath = filePath.replace(/\/{2,}/g, "/");

      const params: IS3 = {
        Bucket: S3_BUCKET_NAME,
        Prefix: filePath,
      };

      const { Contents }: any = await s3.listObjectsV2(params as any).promise();

      if (Contents.length === 0) {
        return { message: "Folder was deleted" };
      }

      const deleteParams: IS3 = {
        Bucket: S3_BUCKET_NAME,
        Delete: { Objects: [] },
      };

      Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
      });

      // remove all inner files in directory
      await s3.deleteObjects(deleteParams as any).promise();

      if (Contents.IsTruncated) {
        await this.deleteBucketFile(file);
      } else {
        await s3
          .deleteObject({
            Bucket: S3_BUCKET_NAME,
            Key: filePath,
          } as any)
          .promise();
      }

      return { message: "Folder was deleted" };
    } else {
      let filePath = `${String(file.storageGuid)}/${file.path}/${file.name}`;

      filePath = filePath.replace(/\/{2,}/g, "/");

      const params: IS3 = {
        Bucket: S3_BUCKET_NAME,
        Key: filePath,
      };

      await s3.deleteObject(params as any).promise();

      return { message: "File was deleted" };
    }
  }

  // get files with search params
  async getFiles(searchParams: ISearchParams) {
    const {
      sort,
      search,
      parentId,
      userId,
      limit: filesLimit,
      offset: filesOffset = 0,
    } = searchParams;
  
    const limit = Number(filesLimit) || Number(FETCH_LIMIT);
    const offset = Number(filesOffset) || 0;
  
    // find by file name
    if (search) {
      const files = await prisma.file.findMany({
        where: {
          userId,
          parentId,
          name: { contains: search, mode: "insensitive" },
        },
      });
      
      return await this.enrichFilesWithSharingInfo(files);
    }
  
    const queryOptions: Prisma.FileFindManyArgs = {
      where: {
        AND: [{ userId }, { parentId }],
      },
      take: limit,
      skip: offset,
    };
  
    // find with sort query
    switch (sort) {
      case "name":
        queryOptions.orderBy = { name: "asc" };
        break;
      case "type":
        queryOptions.orderBy = { type: "asc" };
        break;
      case "date":
        queryOptions.orderBy = { createdAt: "asc" };
        break;
    }
  
    const files = await prisma.file.findMany(queryOptions);
    
    return await this.enrichFilesWithSharingInfo(files);
  }

  /**
   * Upload a file to S3 and create a File record in the database.
   * @param file - Web API File from multipart (name, type, size, arrayBuffer())
   * @param userId - User ID
   * @param parentId - Optional parent folder ID (string from form)
   */
  async uploadFile(
    file: { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> },
    userId: number,
    parentId?: string
  ) {
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageGuid: true, usedSpace: true, diskSpace: true },
    });
    if (!user) {
      throw createError(404, "User not found");
    }

    const fileSize = Number(file.size) || 0;
    if (user.usedSpace + BigInt(fileSize) > user.diskSpace) {
      throw createError(400, "Not enough disk space");
    }

    let folderPath = "";
    const parentIdNum = parentId ? Number(parentId) : undefined;
    if (parentIdNum && !_.isNaN(parentIdNum)) {
      const parent = await prisma.file.findFirst({
        where: { id: parentIdNum, userId },
      });
      if (parent) {
        const base = parent.path ? `${parent.path}/` : "";
        folderPath = `${base}${parent.name}`;
      }
    }

    const keyPath = folderPath ? `${folderPath}/` : "";
    const s3Key = `${user.storageGuid}/${keyPath}${file.name}`.replace(/\/{2,}/g, "/");

    const buffer = Buffer.from(await file.arrayBuffer());
    const params: IS3 = {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
    };
    await s3.putObject(params as any).promise();

    const dbPath = folderPath || "";
    const created = await prisma.file.create({
      data: {
        name: file.name,
        type: file.type || null,
        size: fileSize,
        path: dbPath,
        userId,
        parentId: parentIdNum ?? null,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        usedSpace: user.usedSpace + BigInt(fileSize),
      },
    });

    try {
      await NotificationService.create({
        userId,
        type: "FILE_UPLOAD",
        title: "File uploaded",
        text: file.name,
        link: "/files",
      });
    } catch (_err) {
      // non-blocking
    }

    return created;
  }

  private async enrichFilesWithSharingInfo(files: any[]) {
    if (files.length === 0) return files;
  
    // Получаем все ID файлов
    const fileIds = files.map(f => f.id);
  
    // Получаем все публичные ссылки для этих файлов за один запрос
    const publicLinks = await prisma.permission.findMany({
      where: {
        resourceId: { in: fileIds },
        resourceType: { in: ['FILE', 'FOLDER'] },
        isPublic: true,
      },
      select: {
        resourceId: true,
        publicToken: true,
      },
    });
  
    // Создаем Map для быстрого доступа
    const publicLinksMap = new Map(
      publicLinks.map(link => [link.resourceId, link.publicToken])
    );
  
    // Добавляем информацию о sharing к каждому файлу
    return files.map(file => ({
      ...file,
      isShared: publicLinksMap.has(file.id),
      publicToken: publicLinksMap.get(file.id),
    }));
  }

  async downloadFile(queryId, userId, storageGuid) {
    const file: any = await prisma.file.findFirst({
      where: { id: Number(queryId), userId },
    });

    let filePath = `${String(storageGuid)}/${file.path}/${file.name}`;

    filePath = filePath.replace(/\/{2,}/g, "/");

    const s3object = await s3
      .getObject({
        Bucket: S3_BUCKET_NAME,
        Key: `${filePath}`,
      })
      .promise();

    return { file, s3object };
  }

  async deleteFile(fileId, userId) {
    return prisma.$transaction(async (trx) => {
      if (_.isNaN(fileId)) {
        throw createError(400, "Invalid file ID");
      }

      const file: any = await trx.file.findFirst({
        where: { id: fileId, userId },
      });

      // directory have a content?
      const existInnerContent = await trx.file.findMany({
        where: { parentId: file.id },
      });

      if (!_.isEmpty(existInnerContent)) {
        throw createError(
          400,
          "You cannot delete a folder while it has content",
        );
      }

      if (!file) {
        throw createError(400, "File not found");
      }

      await this.deleteBucketFile(file);

      await trx.file.delete({ where: { id: fileId } });

      const user: any = await trx.user.findFirst({
        where: { id: userId },
      });

      user.usedSpace = user.usedSpace - BigInt(file.size);

      await trx.user.update({
        where: {
          id: user.id,
        },
        data: {
          usedSpace: user.usedSpace,
        },
      });

      const allFiles = await trx.file.findMany({
        where: { userId },
      });

      return allFiles;
    });
  }
}

export const FileService = new FileServiceClass();
