import { prisma } from "../configs/config.js";
import { ResourceType } from "@prisma/client";
import _ from "lodash";
import "dotenv/config.js";
import createError from "http-errors";
import { SharingService } from "./sharingService.js";

interface ITaskData {
  title: string;
  content: string;
  priority?: string;
  dueDate?: Date | string | null;
  columnId?: number;
  userId: number;
}

interface ITaskUpdate {
  title?: string;
  content?: string;
  description?: string | null;
  priority?: string;
  isDone?: boolean;
  dueDate?: Date | string | null;
  columnId?: number;
}

class TaskServiceClass {
  private async ensureBoardAccess(boardId: number, userId: number) {
    const { hasAccess } = await SharingService.checkUserPermission(
      userId,
      ResourceType.KANBAN_BOARD,
      boardId
    );
    if (!hasAccess) {
      throw createError(404, "Board not found");
    }
  }

  async create({ title, content, priority = "LOW", dueDate, columnId, userId }: ITaskData) {
    if (!title || !content) {
      throw createError(400, "Title and content are required");
    }
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (priority && !validPriorities.includes(priority.toUpperCase())) {
      throw createError(400, "Priority must be LOW, MEDIUM, or HIGH");
    }
    if (columnId) {
      const column = await prisma.taskColumn.findFirst({
        where: { id: columnId },
      });
      if (!column) {
        throw createError(400, "Column not found");
      }
      await this.ensureBoardAccess(column.boardId, userId);
    }

    return prisma.$transaction(async (trx) => {

      // Parse dueDate if it's a string
      let parsedDueDate = null;
      if (dueDate) {
        parsedDueDate = typeof dueDate === "string" ? new Date(dueDate) : dueDate;

        // Validate date
        if (isNaN(parsedDueDate.getTime())) {
          throw createError(400, "Invalid due date format");
        }
      }

      const task = await trx.task.create({
        data: {
          title,
          content,
          priority: priority.toUpperCase(),
          dueDate: parsedDueDate,
          columnId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              email: true,
            },
          },
          column: true,
        },
      });

      return task;
    });
  }

  async getAll(userId: number) {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      include: {
        column: true,
      },
      orderBy: [
        { isDone: "asc" }, // Show pending tasks first
        { priority: "desc" }, // HIGH -> MEDIUM -> LOW
        { createdAt: "desc" },
      ],
    });

    return tasks;
  }

  async getByColumn(columnId: number, userId: number) {
    const column = await prisma.taskColumn.findFirst({
      where: { id: columnId },
    });
    if (!column) throw createError(404, "Column not found");
    await this.ensureBoardAccess(column.boardId, userId);
    const tasks = await prisma.task.findMany({
      where: { columnId },
      include: { column: true },
      orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });
    return tasks;
  }

  async getKanbanData(boardId: number, userId: number) {
    await this.ensureBoardAccess(boardId, userId);
    const columns = await prisma.taskColumn.findMany({
      where: { boardId },
      include: {
        tasks: {
          orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
        },
      },
      orderBy: { order: "asc" },
    });
    return columns;
  }

  async getById(id: number, userId: number) {
    const task = await prisma.task.findFirst({
      where: { id },
      include: {
        user: { select: { id: true, userName: true, email: true } },
        column: true,
      },
    });
    if (!task) return null;
    if (task.column) {
      await this.ensureBoardAccess(task.column.boardId, userId);
    } else {
      if (task.userId !== userId) throw createError(404, "Task not found");
    }
    return task;
  }

  async update(id: number, userId: number, updateData: ITaskUpdate) {
    const existingTask = await prisma.task.findFirst({
      where: { id },
      include: { column: true },
    });
    if (!existingTask) throw createError(404, "Task not found");
    if (existingTask.column) {
      await this.ensureBoardAccess(existingTask.column.boardId, userId);
    } else if (existingTask.userId !== userId) {
      throw createError(404, "Task not found");
    }

    return prisma.$transaction(async (trx) => {

      // Validate priority if provided
      if (updateData.priority) {
        const validPriorities = ["LOW", "MEDIUM", "HIGH"];
        if (!validPriorities.includes(updateData.priority.toUpperCase())) {
          throw createError(400, "Priority must be LOW, MEDIUM, or HIGH");
        }
        updateData.priority = updateData.priority.toUpperCase();
      }

      if (updateData.columnId) {
        const column = await trx.taskColumn.findFirst({
          where: { id: updateData.columnId },
        });
        if (!column) throw createError(400, "Column not found");
        if (existingTask.column && column.boardId !== existingTask.column.boardId) {
          throw createError(400, "Column must be on the same board");
        }
      }

      // Parse dueDate if provided
      if (updateData.dueDate !== undefined) {
        if (updateData.dueDate && typeof updateData.dueDate === "string") {
          const parsedDate = new Date(updateData.dueDate);
          if (isNaN(parsedDate.getTime())) {
            throw createError(400, "Invalid due date format");
          }
          updateData.dueDate = parsedDate;
        }
      }

      const task = await trx.task.update({
        where: {
          id,
        },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              email: true,
            },
          },
          column: true,
        },
      });

      return task;
    });
  }

  async delete(id: number, userId: number) {
    const existingTask = await prisma.task.findFirst({
      where: { id },
      include: { column: true },
    });
    if (!existingTask) throw createError(404, "Task not found");
    if (existingTask.column) {
      await this.ensureBoardAccess(existingTask.column.boardId, userId);
    } else if (existingTask.userId !== userId) {
      throw createError(404, "Task not found");
    }

    return prisma.$transaction(async (trx) => {
      await trx.task.delete({
        where: {
          id,
        },
      });

      return { message: "Task deleted successfully" };
    });
  }

  async toggleComplete(id: number, userId: number) {
    const existingTask = await prisma.task.findFirst({
      where: { id },
      include: { column: true },
    });
    if (!existingTask) throw createError(404, "Task not found");
    if (existingTask.column) {
      await this.ensureBoardAccess(existingTask.column.boardId, userId);
    } else if (existingTask.userId !== userId) {
      throw createError(404, "Task not found");
    }

    return prisma.$transaction(async (trx) => {
      const task = await trx.task.update({
        where: {
          id,
        },
        data: {
          isDone: !existingTask.isDone,
        },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              email: true,
            },
          },
          column: true,
        },
      });

      return task;
    });
  }

  async moveToColumn(id: number, columnId: number, userId: number) {
    const [existingTask, column] = await Promise.all([
      prisma.task.findFirst({
        where: { id },
        include: { column: true },
      }),
      prisma.taskColumn.findFirst({
        where: { id: columnId },
      }),
    ]);
    if (!existingTask) throw createError(404, "Task not found");
    if (!column) throw createError(404, "Column not found");
    const taskBoardId = existingTask.column?.boardId ?? column.boardId;
    if (column.boardId !== taskBoardId) {
      throw createError(400, "Task and column must be on the same board");
    }
    await this.ensureBoardAccess(column.boardId, userId);

    return prisma.$transaction(async (trx) => {

      return trx.task.update({
        where: { id },
        data: { columnId },
        include: {
          user: { select: { id: true, userName: true, email: true } },
          column: true,
        },
      });
    });
  }

  async search(userId: number, query: string) {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        column: true,
      },
      orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    return tasks;
  }

  async getByPriority(userId: number, priority: string) {
    // Validate priority
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (!validPriorities.includes(priority)) {
      throw createError(400, "Priority must be LOW, MEDIUM, or HIGH");
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        priority,
      },
      include: {
        column: true,
      },
      orderBy: [{ isDone: "asc" }, { createdAt: "desc" }],
    });

    return tasks;
  }

  async getByStatus(userId: number, isDone: boolean) {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isDone,
      },
      include: {
        column: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return tasks;
  }

  // Additional utility methods
  async getOverdueTasks(userId: number) {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isDone: false,
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        column: true,
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });

    return tasks;
  }

  async getUpcomingTasks(userId: number, days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isDone: false,
        dueDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        column: true,
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });

    return tasks;
  }

  async getTaskStats(userId: number) {
    const [total, completed, pending, overdue] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, isDone: true } }),
      prisma.task.count({ where: { userId, isDone: false } }),
      prisma.task.count({
        where: {
          userId,
          isDone: false,
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    // Группировка задач по приоритету
    const priorityStats = await prisma.task.groupBy({
      by: ["priority"],
      where: { userId, isDone: false },
      _count: { priority: true },
    });

    // Группировка задач по колонкам
    const columnStats = await prisma.task.groupBy({
      by: ["columnId"],
      where: { userId },
      _count: { columnId: true },
    });

    return {
      total,
      completed,
      pending,
      overdue,
      byPriority: priorityStats.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<string, number>),
      byColumn: columnStats.reduce((acc, item) => {
        if (item.columnId) {
          acc[item.columnId] = item._count.columnId;
        }
        return acc;
      }, {} as Record<number, number>),
    };
  }

  // Batch operations for kanban
  async batchUpdateTasks(userId: number, updates: Array<{ id: number; columnId?: number; order?: number }>) {
    return prisma.$transaction(async (trx) => {
      const results = [];

      for (const update of updates) {
        // Verify task belongs to user
        const existingTask = await trx.task.findFirst({
          where: {
            id: update.id,
            userId,
          },
        });

        if (!existingTask) {
          continue; // Skip invalid tasks
        }

        // Verify column if provided
        if (update.columnId) {
          const column = await trx.taskColumn.findFirst({
            where: {
              id: update.columnId,
              userId,
            },
          });

          if (!column) {
            continue; // Skip invalid columns
          }
        }

        const updatedTask = await trx.task.update({
          where: { id: update.id },
          data: {
            columnId: update.columnId,
            // Note: order field would need to be added to schema if needed
          },
          include: {
            column: true,
          },
        });

        results.push(updatedTask);
      }

      return results;
    });
  }
}

export const TaskService = new TaskServiceClass();
