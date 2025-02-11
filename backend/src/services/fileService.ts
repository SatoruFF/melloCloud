import _ from 'lodash';
import createError from 'http-errors';
import 'dotenv/config.js';

import { prisma, s3 } from '../configs/config.js';

interface File {
  userId: number;
  path: string;
  name?: string;
  type: string | 'dir' | 'file';
  url?: string;
}

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

class FileServiceClass {
  // create dir or file
  async createDir(file: File): Promise<CreateDirResponse> {
    let folderPath = `${file.userId}/${file.path}`;

    if (!folderPath.endsWith('/')) {
      folderPath += '/';
    }

    const params: IS3 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: folderPath,
      Body: '',
    };

    const getParams: IS3 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: folderPath,
    };

    await s3.putObject(params as any).promise();

    const newDirUrl = await s3.getSignedUrl('getObject', getParams);

    return newDirUrl;
  }

  // delete file or directory
  async deleteBucketFile(file: File): Promise<DeleteFileResponse> {
    if (file.type === 'dir') {
      let filePath = `${String(file.userId)}/${file.path}`;

      filePath = filePath.replace(/\/{2,}/g, '/');

      const params: IS3 = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: filePath,
      };

      const { Contents }: any = await s3.listObjectsV2(params as any).promise();

      if (Contents.length === 0) {
        return { message: 'Folder was deleted' };
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

      return { message: 'Folder was deleted' };
    } else {
      let filePath = `${String(file.userId)}/${file.path}/${file.name}`;

      filePath = filePath.replace(/\/{2,}/g, '/');

      const params: IS3 = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath,
      };

      await s3.deleteObject(params as any).promise();

      return { message: 'File was deleted' };
    }
  }

  // get files with search params
  async getFiles(sort, search, parentId, userId) {
    let files: any;

    // find by file name
    if (search) {
      files = await prisma.file.findMany({
        where: { userId },
      });

      files = _.filter(files, file => _.includes(file.name, search));

      return files;
    }

    // find with sort query
    switch (sort) {
      case 'name':
        files = await prisma.file.findMany({
          where: {
            AND: [{ userId }, { parentId }],
          },
          orderBy: { name: 'asc' },
        });

        break;
      case 'type':
        files = await prisma.file.findMany({
          where: {
            AND: [{ userId }, { parentId }],
          },
          orderBy: { type: 'asc' },
        });

        break;
      case 'date':
        files = await prisma.file.findMany({
          where: {
            AND: [{ userId }, { parentId }],
          },
          orderBy: { createdAt: 'asc' },
        });
        break;

      default:
        files = await prisma.file.findMany({
          where: {
            AND: [{ userId }, { parentId }],
          },
        });

        break;
    }

    return files;
  }

  // upload file
  async uploadFile(file: any, userId, parentId?: string): Promise<any> {
    return prisma.$transaction(async trx => {
      let parent;

      if (parentId !== 'null' || !_.isNil(parentId)) {
        parent = await trx.file.findFirst({
          where: { userId, id: Number(parentId) },
        });
      }

      const user: any = await trx.user.findFirst({
        where: { id: userId },
      });

      // check size on disc after upload
      if (user.usedSpace + BigInt(file.size) > user.diskSpace) {
        throw createError(400, 'Not enough space on the disk');
      }

      user.usedSpace += BigInt(file.size);

      let filePath;

      // find parent with his path
      if (parent) {
        filePath = `${String(user.id)}/${parent.path}/${file.name}`;
      } else {
        filePath = `${String(user.id)}/${file.name}`;
      }

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath,
        Body: file.data,
      };

      const newFile = await s3.upload(params).promise();

      // get url for download new file
      const fileUrl = _.get(newFile, 'Location', '');

      const dbFile = await trx.file.create({
        data: {
          name: file.name,
          type: file.name.split('.').pop(),
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

  async downloadFile(queryId, userId) {
    const file: any = await prisma.file.findFirst({
      where: { id: Number(queryId), userId },
    });

    let filePath = `${String(userId)}/${file.path}/${file.name}`;

    filePath = filePath.replace(/\/{2,}/g, '/');

    const s3object = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${filePath}`,
      })
      .promise();

    return { file, s3object };
  }

  async deleteFile(fileId, userId) {
    return prisma.$transaction(async trx => {
      if (_.isNaN(fileId)) {
        throw createError(400, 'Invalid file ID');
      }

      const file: any = await trx.file.findFirst({
        where: { id: fileId, userId },
      });

      // directory have a content?
      const existInnerContent = await trx.file.findMany({
        where: { parentId: file.id },
      });

      if (!_.isEmpty(existInnerContent)) {
        throw createError(400, 'You cannot delete a folder while it has content');
      }

      if (!file) {
        throw createError(400, 'File not found');
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
