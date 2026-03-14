import type { Context } from "hono";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { BoardService } from "../services/boardService.js";
import { getErrorMessage, getErrorStatusCode } from "../types/errors.js";

function getUserId(c: Context): number {
  const user = c.get("user") as { id?: number } | undefined;
  const userId = user?.id ?? c.get("userId");
  if (!userId) {
    throw createError(401, "User not found");
  }
  return userId as number;
}

class BoardControllerClass {
  async create(c: Context) {
    try {
      const body = await c.req.json<{ title: string }>();
      const { title } = body;
      const userId = getUserId(c);
      if (!title?.trim()) {
        throw createError(400, "Title is required");
      }
      const board = await BoardService.create({ title: title.trim(), userId });
      return c.json(board);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async getAll(c: Context) {
    try {
      const userId = getUserId(c);
      const boards = await BoardService.getAll(userId);
      return c.json(boards);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) throw createError(400, "Board ID is required");
      const userId = getUserId(c);
      const board = await BoardService.getById(Number(id), userId);
      return c.json(board);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) throw createError(400, "Board ID is required");
      const body = await c.req.json<{ title?: string }>();
      const userId = getUserId(c);
      const board = await BoardService.update(Number(id), userId, body);
      return c.json(board);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) throw createError(400, "Board ID is required");
      const userId = getUserId(c);
      const result = await BoardService.delete(Number(id), userId);
      return c.json(result, 200);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = getErrorStatusCode(error);
      logger.error(message, error);
      return c.json({ message }, statusCode);
    }
  }
}

export const BoardController = new BoardControllerClass();
