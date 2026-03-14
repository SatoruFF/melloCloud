import "dotenv/config.js";
import type { Context } from "hono";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { ColumnService } from "../services/columnService.js";
import { getErrorMessage, getErrorStatusCode } from "../types/errors.js";

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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  // Reorder columns
  async reorder(c: Context) {
    try {
      const body = await c.req.json<{
        columnOrders: Array<{ id: number; order: number }>;
        boardId: number;
      }>();
      const { columnOrders, boardId } = body;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!boardId) {
        throw createError(400, "boardId is required");
      }

      if (!columnOrders || !Array.isArray(columnOrders)) {
        throw createError(400, "Invalid column orders data");
      }

      const columns = await ColumnService.reorderColumns(userId, columnOrders, boardId);

      return c.json(columns);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }
}

export const ColumnController = new ColumnControllerClass();
