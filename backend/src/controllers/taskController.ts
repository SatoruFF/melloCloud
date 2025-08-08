import _ from "lodash";
import "dotenv/config.js";
import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { TaskService } from "../services/taskService.js";

class TaskControllerClass {
  // Create task controller
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const { title, content, priority, dueDate } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const task = await TaskService.create({
        title,
        content,
        priority,
        dueDate,
        userId,
      });

      return res.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get all tasks for user
  async getAll(req: any, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const tasks = await TaskService.getAll(userId);

      return res.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get task by ID
  async getById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      const task = await TaskService.getById(Number(id), userId);

      if (!task) throw createError(404, "Task not found");

      return res.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Update task
  async update(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { title, content, priority, isDone, dueDate } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      const task = await TaskService.update(Number(id), userId, {
        title,
        content,
        priority,
        isDone,
        dueDate,
      });

      return res.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Delete task
  async delete(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      await TaskService.delete(Number(id), userId);

      return res.status(200).json({ message: "Task successfully deleted" });
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Toggle task completion status
  async toggleComplete(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      const task = await TaskService.toggleComplete(Number(id), userId);

      return res.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Search tasks
  async search(req: any, res: Response) {
    try {
      const query = req.query.query?.toString().toLowerCase();
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!query) throw createError(400, "Empty query");

      const tasks = await TaskService.search(userId, query);

      return res.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get tasks by priority
  async getByPriority(req: any, res: Response) {
    try {
      const { priority } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!priority) throw createError(400, "Empty priority");

      const tasks = await TaskService.getByPriority(userId, priority.toUpperCase());

      return res.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // Get tasks by completion status
  async getByStatus(req: any, res: Response) {
    try {
      const { status } = req.params; // 'completed' or 'pending'
      const userId = req.user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!status) throw createError(400, "Empty status");

      const isDone = status.toLowerCase() === "completed";
      const tasks = await TaskService.getByStatus(userId, isDone);

      return res.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const TaskController = new TaskControllerClass();
