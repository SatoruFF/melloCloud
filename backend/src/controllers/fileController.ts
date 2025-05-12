// base
import type { Request, Response } from "express";

// services
import { FETCH_LIMIT, prisma } from "../configs/config.js";
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
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} The created directory information or error message.
   */
  async createDir(req: Request, res: Response) {
    try {
      const { name, type, parent } = req.body;
      const userId = _.get(req, ["user", "id"]);

      const doubledFolder = await prisma.file.findFirst({
        where: { name, parentId: parent },
      });

      if (!_.isEmpty(doubledFolder)) {
        throw createError(400, "Folder name is not unique!");
      }

      const fileInstance = {
        name,
        type,
        parentId: parent,
        userId,
        path: "",
        url: "",
        storageGuid: user?.storageGuid,
      };

      let itemUrl;

      if (parent == null) {
        fileInstance.path = name;
        itemUrl = await FileService.createDir(fileInstance);
      } else {
        const parentFile = await prisma.file.findFirst({
          where: { id: parent, userId },
        });

        if (_.isEmpty(parentFile)) {
          throw createError(400, "Parent directory not found");
        }

        fileInstance.path = `${parentFile.path}/${name}`;

        itemUrl = await FileService.createDir(fileInstance);
      }

      fileInstance.url = itemUrl;

      const file = await prisma.file.create({
        data: fileInstance,
      });

      return res.json(file);
    } catch (error: Error) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  /**
   * Retrieves files for the user based on sort, search, and parent folder.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} The list of files or error message.
   */
  async getFiles(req, res) {
    try {
      const { sort, search, limit, offset } = req.query;
      const parentId = Number.parseInt(req.query.parent) || null;
      const userId = _.get(req, ["user", "id"]);

      const user = await getUserById(userId);

      const searchParams = {
        storageGuid: user?.storageGuid,
        sort,
        limit,
        offset,
        search,
        parentId,
        userId,
      };

      const files = await FileService.getFiles(searchParams);

      return res.json(files);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  /**
   * Uploads a file for the user to the storage.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} The uploaded file data or error message.
   */
  async uploadFile(req, res) {
    try {
      const file = req.files.file;
      const userId = req.user.id;
      const parentId = req.body.parent;

      const user = await getUserById(userId);

      const savedFile = await FileService.uploadFile(file, userId, parentId, user.storageGuid);

      return res.json(savedFile);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  /**
   * Downloads a file for the user.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} The downloaded file stream or error message.
   */
  async downloadFile(req, res) {
    try {
      const userId = req.user.id;
      const queryId = req.query.id;

      const user = await getUserById(userId);

      const { s3object, file } = await FileService.downloadFile(queryId, userId, user.storageGuid);

      const stream = new PassThrough();
      stream.end(s3object.Body);

      res.setHeader("Content-disposition", "attachment; filename=" + file.name);
      res.setHeader("Content-type", file.type);
      res.attachment(file.name);

      stream.pipe(res);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  /**
   * Deletes a file for the user.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} The updated file list or error message.
   */
  async deleteFile(req, res) {
    try {
      const fileId = Number(req.query.id);
      const userId = req.user.id;

      const user = await getUserById(userId);

      const allFiles = await FileService.deleteFile(fileId, userId, user.storageGuid);

      return res.json(allFiles);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  /**
   * Uploads an avatar for the user.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} The avatar URL or error message.
   */
  async uploadAvatar(req, res) {
    try {
      const fileBuffer = req.files.file.data;
      const userId = req.user.id;

      const avatarUrl = await Avatar.uploadAvatar(fileBuffer, userId);

      return res.json(avatarUrl);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  /**
   * Deletes the user's avatar.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} The user data after avatar deletion or error message.
   */
  async deleteAvatar(req, res) {
    try {
      const userId = req.user.id;

      const user = await Avatar.deleteAvatar(userId);

      return res.json(user);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const FileController = new FileControllerClass();
