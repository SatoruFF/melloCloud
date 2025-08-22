import { prisma } from "../configs/config.js";
import _ from "lodash";
import "dotenv/config.js";
import createError from "http-errors";

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
  priority?: string;
  isDone?: boolean;
  dueDate?: Date | string | null;
  columnId?: number;
}

class TaskServiceClass {
  async create({ title, content, priority = "LOW", dueDate, columnId, userId }: ITaskData) {
    return prisma.$transaction(async (trx) => {
      // Validate required fields
      if (!title || !content) {
        throw createError(400, "Title and content are required");
      }

      // Validate priority
      const validPriorities = ["LOW", "MEDIUM", "HIGH"];
      if (priority && !validPriorities.includes(priority.toUpperCase())) {
        throw createError(400, "Priority must be LOW, MEDIUM, or HIGH");
      }

      // Validate column if provided
      if (columnId) {
        const column = await trx.taskColumn.findFirst({
          where: {
            id: columnId,
            userId,
          },
        });

        if (!column) {
          throw createError(400, "Column not found or doesn't belong to user");
        }
      }

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

  // Get tasks by column
  async getByColumn(columnId: number, userId: number) {
    // First verify the column belongs to the user
    const column = await prisma.taskColumn.findFirst({
      where: {
        id: columnId,
        userId,
      },
    });

    if (!column) {
      throw createError(404, "Column not found");
    }

    const tasks = await prisma.task.findMany({
      where: {
        columnId,
        userId,
      },
      include: {
        column: true,
      },
      orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    return tasks;
  }

  // Get kanban board data (columns with tasks)
  async getKanbanData(userId: number) {
    const columns = await prisma.taskColumn.findMany({
      where: {
        userId,
      },
      include: {
        tasks: {
          orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return columns;
  }

  async getById(id: number, userId: number) {
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId, // Ensure user can only access their own tasks
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
  }

  async update(id: number, userId: number, updateData: ITaskUpdate) {
    return prisma.$transaction(async (trx) => {
      // First check if task exists and belongs to user
      const existingTask = await trx.task.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingTask) {
        throw createError(404, "Task not found");
      }

      // Validate priority if provided
      if (updateData.priority) {
        const validPriorities = ["LOW", "MEDIUM", "HIGH"];
        if (!validPriorities.includes(updateData.priority.toUpperCase())) {
          throw createError(400, "Priority must be LOW, MEDIUM, or HIGH");
        }
        updateData.priority = updateData.priority.toUpperCase();
      }

      // Validate column if provided
      if (updateData.columnId) {
        const column = await trx.taskColumn.findFirst({
          where: {
            id: updateData.columnId,
            userId,
          },
        });

        if (!column) {
          throw createError(400, "Column not found or doesn't belong to user");
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
    return prisma.$transaction(async (trx) => {
      // First check if task exists and belongs to user
      const existingTask = await trx.task.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingTask) {
        throw createError(404, "Task not found");
      }

      await trx.task.delete({
        where: {
          id,
        },
      });

      return { message: "Task deleted successfully" };
    });
  }

  async toggleComplete(id: number, userId: number) {
    return prisma.$transaction(async (trx) => {
      // First get current task state
      const existingTask = await trx.task.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingTask) {
        throw createError(404, "Task not found");
      }

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

  // Move task to different column
  async moveToColumn(id: number, columnId: number, userId: number) {
    return prisma.$transaction(async (trx) => {
      // Verify task belongs to user
      const existingTask = await trx.task.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingTask) {
        throw createError(404, "Task not found");
      }

      // Verify column belongs to user
      const column = await trx.taskColumn.findFirst({
        where: {
          id: columnId,
          userId,
        },
      });

      if (!column) {
        throw createError(404, "Column not found");
      }

      const task = await trx.task.update({
        where: {
          id,
        },
        data: {
          columnId,
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
