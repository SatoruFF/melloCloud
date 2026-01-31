import "dotenv/config.js";
import type { Context } from "hono";
import createError from "http-errors";

import { logger } from "../configs/logger.js";

import { TaskService } from "../services/taskService.js";

class TaskControllerClass {
  // Create task controller
  async create(c: Context) {
    try {
      const body = await c.req.json<{
        title: string;
        content?: string;
        priority?: string;
        dueDate?: string;
        columnId?: number;
      }>();

      const { title, content, priority, dueDate, columnId } = body;
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const task = await TaskService.create({
        title,
        content,
        priority,
        dueDate,
        columnId,
        userId,
      });

      return c.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get all tasks for user
  async getAll(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const tasks = await TaskService.getAll(userId);

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async getKanban(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;
      if (!userId) throw createError(401, "User not found");
      const boardId = c.req.query("boardId");
      if (!boardId) throw createError(400, "boardId query is required");
      const kanbanData = await TaskService.getKanbanData(Number(boardId), userId);
      return c.json(kanbanData);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get tasks by column
  async getByColumn(c: Context) {
    try {
      const { columnId } = c.req.param();
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!columnId) throw createError(400, "Empty column ID");

      const tasks = await TaskService.getByColumn(Number(columnId), userId);

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get task by ID
  async getById(c: Context) {
    try {
      const { id } = c.req.param();
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      const task = await TaskService.getById(Number(id), userId);

      if (!task) throw createError(404, "Task not found");

      return c.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Update task
  async update(c: Context) {
    try {
      const { id } = c.req.param();
      const body = await c.req.json<{
        title?: string;
        content?: string;
        description?: string | null;
        priority?: string;
        isDone?: boolean;
        dueDate?: string;
        columnId?: number;
      }>();
      const { title, content, description, priority, isDone, dueDate, columnId } = body;
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      const task = await TaskService.update(Number(id), userId, {
        title,
        content,
        description,
        priority,
        isDone,
        dueDate,
        columnId,
      });

      return c.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Delete task
  async delete(c: Context) {
    try {
      const { id } = c.req.param();
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      await TaskService.delete(Number(id), userId);

      return c.json({ message: "Task successfully deleted" }, 200);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Toggle task completion status
  async toggleComplete(c: Context) {
    try {
      const { id } = c.req.param();
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");

      const task = await TaskService.toggleComplete(Number(id), userId);

      return c.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Move task to different column
  async moveToColumn(c: Context) {
    try {
      const { id } = c.req.param();
      const body = await c.req.json<{ columnId: number }>();
      const { columnId } = body;
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!id) throw createError(400, "Empty task ID");
      if (!columnId) throw createError(400, "Empty column ID");

      const task = await TaskService.moveToColumn(Number(id), Number(columnId), userId);

      return c.json(task);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Search tasks
  async search(c: Context) {
    try {
      const query = c.req.query("query")?.toString().toLowerCase();
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!query) throw createError(400, "Empty query");

      const tasks = await TaskService.search(userId, query);

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get tasks by priority
  async getByPriority(c: Context) {
    try {
      const { priority } = c.req.param();
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!priority) throw createError(400, "Empty priority");

      const tasks = await TaskService.getByPriority(userId, priority.toUpperCase());

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get tasks by completion status
  async getByStatus(c: Context) {
    try {
      const { status } = c.req.param(); // 'completed' or 'pending'
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!status) throw createError(400, "Empty status");

      const isDone = status.toLowerCase() === "completed";
      const tasks = await TaskService.getByStatus(userId, isDone);

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get overdue tasks
  async getOverdue(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const tasks = await TaskService.getOverdueTasks(userId);

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get upcoming tasks
  async getUpcoming(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;
      const days = Number(c.req.query("days") ?? 7);

      if (!userId) {
        throw createError(401, "User not found");
      }

      const tasks = await TaskService.getUpcomingTasks(userId, days);

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Get task statistics
  async getStats(c: Context) {
    try {
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      const stats = await TaskService.getTaskStats(userId);

      return c.json(stats);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // Batch update tasks (for drag and drop)
  async batchUpdate(c: Context) {
    try {
      const body = await c.req.json<{ updates: any[] }>();
      const { updates } = body; // Array of { id, columnId, order }
      const user = c.get("user") as { id?: number } | undefined;
      const userId = user?.id;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!updates || !Array.isArray(updates)) {
        throw createError(400, "Invalid updates data");
      }

      const tasks = await TaskService.batchUpdateTasks(userId, updates);

      return c.json(tasks);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const TaskController = new TaskControllerClass();
