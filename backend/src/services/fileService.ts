import createError from "http-errors";
import _ from "lodash";
import type { Prisma } from "@prisma/client";
import "dotenv/config.js";

import { FETCH_LIMIT, prisma, s3 } from "../configs/config.js";
import type { IFile, ISearchParams } from "./../types/File";

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
      Bucket: process.env.S3_BUCKET_NAME,
      Key: folderPath,
      Body: "",
    };

    const getParams: IS3 = {
      Bucket: process.env.S3_BUCKET_NAME,
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
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: filePath,
      };

      const { Contents }: any = await s3.listObjectsV2(params as any).promise();

      if (Contents.length === 0) {
        return { message: "Folder was deleted" };
      }

      const deleteParams: IS3 = {
        Bucket: process.env.S3_BUCKET_NAME,
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
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filePath,
          } as any)
          .promise();
      }

      return { message: "Folder was deleted" };
    } else {
      let filePath = `${String(file.storageGuid)}/${file.path}/${file.name}`;

      filePath = filePath.replace(/\/{2,}/g, "/");

      const params: IS3 = {
        Bucket: process.env.S3_BUCKET_NAME,
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
      return await prisma.file.findMany({
        where: {
          userId,
          parentId,
          name: { contains: search, mode: "insensitive" }, // ILIKE analog in Prisma
        },
      });
    }

    // FIXME: typo
    const queryOptions: Prisma.FileFindManyArgs = {
      where: {
        AND: [{ userId }, { parentId }],
      },
      take: limit, // analog LIMIT https://www.prisma.io/docs/orm/prisma-client/queries/pagination
      skip: offset, // analog OFFSET
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

    return await prisma.file.findMany(queryOptions);
  }

  // upload file
  async uploadFile(file: any, userId, parentId?: string): Promise<any> {
    return prisma.$transaction(async (trx) => {
      let parent;

      if (parentId !== "null" && !_.isNil(parentId)) {
        parent = await trx.file.findFirst({
          where: { userId, id: Number(parentId) },
        });
      }

      const user: any = await trx.user.findFirst({
        where: { id: userId },
      });

      // check size on disc after upload
      if (user.usedSpace + BigInt(file.size) > user.diskSpace) {
        throw createError(400, "Not enough space on the disk");
      }

      user.usedSpace += BigInt(file.size);

      let filePath;

      // find parent with his path
      if (parent) {
        filePath = `${String(user.storageGuid)}/${parent.path}/${file.name}`;
      } else {
        filePath = `${String(user.storageGuid)}/${file.name}`;
      }

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath,
        Body: file.data,
      };

      const newFile = await s3.upload(params).promise();

      // get url for download new file
      const fileUrl = _.get(newFile, "Location", "");

      const dbFile = await trx.file.create({
        data: {
          name: file.name,
          type: file.name.split(".").pop(),
          size: file.size,
          path: parent?.path,
          parentId: parent ? parent.id : null,
          userId: user.id,
          url: fileUrl,
        },
      });

      // after we must fill used space
      await trx.user.update({
        where: {
          id: user.id,
        },
        data: {
          usedSpace: user.usedSpace,
        },
      });

      return dbFile;
    });
  }

  async downloadFile(queryId, userId, storageGuid) {
    const file: any = await prisma.file.findFirst({
      where: { id: Number(queryId), userId },
    });

    let filePath = `${String(storageGuid)}/${file.path}/${file.name}`;

    filePath = filePath.replace(/\/{2,}/g, "/");

    const s3object = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET_NAME,
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
