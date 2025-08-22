import _ from "lodash";
import "dotenv/config.js";
import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { ColumnService } from "../services/columnService.js";

class ColumnControllerClass {
  // Create column controller
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const { title, color } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const column = await ColumnService.create({
        title,
        color,
        userId,
      });

      return res.json(column);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get all columns for user
  async getAll(req: any, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const columns = await ColumnService.getAll(userId);

      return res.json(columns);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get column by ID
  async getById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty column ID");

      const column = await ColumnService.getById(Number(id), userId);

      if (!column) throw createError(404, "Column not found");

      return res.json(column);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Update column
  async update(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { title, color, order } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty column ID");

      const column = await ColumnService.update(Number(id), userId, {
        title,
        color,
        order,
      });

      return res.json(column);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Delete column
  async delete(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty column ID");

      await ColumnService.delete(Number(id), userId);

      return res.status(200).json({ message: "Column successfully deleted" });
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Reorder columns
  async reorder(req: any, res: Response) {
    try {
      const { columnOrders } = req.body; // Array of { id, order }
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!columnOrders || !Array.isArray(columnOrders)) {
        throw createError(400, "Invalid column orders data");
      }

      const columns = await ColumnService.reorderColumns(userId, columnOrders);

      return res.json(columns);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Move task between columns
  async moveTask(req: any, res: Response) {
    try {
      const { taskId, columnId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!taskId || !columnId) {
        throw createError(400, "Task ID and Column ID are required");
      }

      const task = await ColumnService.moveTask(Number(taskId), Number(columnId), userId);

      return res.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get column statistics
  async getStats(req: any, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const stats = await ColumnService.getColumnStats(userId);

      return res.json(stats);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const ColumnController = new ColumnControllerClass();
