import type { Request, Response } from "express";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { NotesService } from "../services/noteService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";

class NotesControllerClass {
  async getUserNotes(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      if (!userId) {
        throw createError(401, "User not found");
      }

      const notes = await NotesService.getUserNotes(req.context, userId);
      return res.json(serializeBigInt(notes));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async getNote(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { noteId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!noteId) {
        throw createError(400, "Note ID is required");
      }

      const note = await NotesService.getNote(req.context, noteId, userId);
      return res.json(serializeBigInt(note));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async createNote(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { title, content } = req.body;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!title) {
        throw createError(400, "Title is required");
      }

      const note = await NotesService.createNote(req.context, userId, {
        title,
        content,
      });

      return res.status(201).json(serializeBigInt(note));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async updateNote(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { noteId } = req.params;
      const { title, content } = req.body;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!noteId) {
        throw createError(400, "Note ID is required");
      }

      const note = await NotesService.updateNote(req.context, noteId, userId, {
        title,
        content,
      });

      return res.json(serializeBigInt(note));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async deleteNote(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { noteId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!noteId) {
        throw createError(400, "Note ID is required");
      }

      const result = await NotesService.deleteNote(req.context, noteId, userId);
      return res.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async searchNotes(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { query } = req.query;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!query || typeof query !== "string") {
        throw createError(400, "Search query is required");
      }

      const notes = await NotesService.searchNotes(req.context, userId, query);
      return res.json(serializeBigInt(notes));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const NotesController = new NotesControllerClass();
