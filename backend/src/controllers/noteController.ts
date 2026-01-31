import type { Context } from "hono";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { NotesService } from "../services/noteService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";
import ApiContext from "../models/context.js";

class NotesControllerClass {
  async getUserNotes(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) {
        throw createError(401, "User not found");
      }

      const notes = await NotesService.getUserNotes(apiContext, userId);
      return c.json(serializeBigInt(notes));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async getNote(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { noteId } = c.req.param();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!noteId) {
        throw createError(400, "Note ID is required");
      }

      const note = await NotesService.getNote(apiContext, noteId, userId);
      return c.json(serializeBigInt(note));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async createNote(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { title, content, tags } = await c.req.json<{
        title: string;
        content?: string;
        tags?: unknown;
      }>();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!title) {
        throw createError(400, "Title is required");
      }

      // Валидация tags
      if (tags !== undefined && !Array.isArray(tags)) {
        throw createError(400, "Tags must be an array");
      }

      const note = await NotesService.createNote(apiContext, userId, {
        title,
        content,
        tags,
      });

      return c.json(serializeBigInt(note), 201);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async updateNote(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { noteId } = c.req.param();
      const { title, content, isStarred, tags } = await c.req.json<{
        title?: string;
        content?: string;
        isStarred?: boolean;
        tags?: unknown;
      }>();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!noteId) {
        throw createError(400, "Note ID is required");
      }

      // Валидация isStarred
      if (isStarred !== undefined && typeof isStarred !== "boolean") {
        throw createError(400, "isStarred must be a boolean");
      }

      // Валидация tags
      if (tags !== undefined && !Array.isArray(tags)) {
        throw createError(400, "Tags must be an array");
      }

      const note = await NotesService.updateNote(apiContext, noteId, userId, {
        title,
        content,
        isStarred,
        tags,
      });

      return c.json(serializeBigInt(note));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async deleteNote(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { noteId } = c.req.param();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!noteId) {
        throw createError(400, "Note ID is required");
      }

      const result = await NotesService.deleteNote(apiContext, noteId, userId);
      return c.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async searchNotes(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { query } = c.req.query();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!query || typeof query !== "string") {
        throw createError(400, "Search query is required");
      }

      const notes = await NotesService.searchNotes(apiContext, userId, query);
      return c.json(serializeBigInt(notes));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const NotesController = new NotesControllerClass();
