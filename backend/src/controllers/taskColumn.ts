import "dotenv/config.js";
import type { Context } from "hono";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { ColumnService } from "../services/columnService.js";

class ColumnControllerClass {
  async create(c: Context) {
    try {
      const body = await c.req.json<{ title: string; color?: string; boardId: number }>();
      const { title, color, boardId } = body;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) throw createError(401, "User not found");
      if (!boardId) throw createError(400, "boardId is required");
      const column = await ColumnService.create({
        title: title ?? "Column",
        color: color ?? "#5c6bc0",
        userId,
        boardId,
      });
      return c.json(column);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async getAll(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) throw createError(401, "User not found");
      const boardId = c.req.query("boardId");
      const columns = boardId
        ? await ColumnService.getByBoardId(Number(boardId), userId)
        : await ColumnService.getAll(userId);
      return c.json(columns);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get column by ID
  async getById(c: Context) {
    try {
      const { id } = c.req.param();
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty column ID");

      const column = await ColumnService.getById(Number(id), userId);

      if (!column) throw createError(404, "Column not found");

      return c.json(column);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Update column
  async update(c: Context) {
    try {
      const { id } = c.req.param();
      const body = await c.req.json<{ title?: string; color?: string; order?: number }>();
      const { title, color, order } = body;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty column ID");

      const column = await ColumnService.update(Number(id), userId, {
        title,
        color,
        order,
      });

      return c.json(column);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Delete column
  async delete(c: Context) {
    try {
      const { id } = c.req.param();
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty column ID");

      await ColumnService.delete(Number(id), userId);

      return c.json({ message: "Column successfully deleted" }, 200);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Reorder columns
  async reorder(c: Context) {
    try {
      const body = await c.req.json<{ columnOrders: Array<{ id: number; order: number }> }>();
      const { columnOrders } = body; // Array of { id, order }
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!columnOrders || !Array.isArray(columnOrders)) {
        throw createError(400, "Invalid column orders data");
      }

      const columns = await ColumnService.reorderColumns(userId, columnOrders);

      return c.json(columns);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Move task between columns
  async moveTask(c: Context) {
    try {
      const body = await c.req.json<{ taskId: number; columnId: number }>();
      const { taskId, columnId } = body;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!taskId || !columnId) {
        throw createError(400, "Task ID and Column ID are required");
      }

      const task = await ColumnService.moveTask(Number(taskId), Number(columnId), userId);

      return c.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async getStats(c: Context) {
    try {
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) throw createError(401, "User not found");
      const boardId = c.req.query("boardId");
      if (!boardId) throw createError(400, "boardId query is required");
      const stats = await ColumnService.getColumnStats(userId, Number(boardId));
      return c.json(stats);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const ColumnController = new ColumnControllerClass();
