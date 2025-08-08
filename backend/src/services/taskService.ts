import { prisma } from "../configs/config.js";
import _ from "lodash";
import "dotenv/config.js";
import createError from "http-errors";

interface ITaskData {
  title: string;
  content: string;
  priority?: string;
  dueDate?: Date | string | null;
  userId: number;
}

interface ITaskUpdate {
  title?: string;
  content?: string;
  priority?: string;
  isDone?: boolean;
  dueDate?: Date | string | null;
}

class TaskServiceClass {
  async create({ title, content, priority = "LOW", dueDate, userId }: ITaskData) {
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
      orderBy: [
        { isDone: "asc" }, // Show pending tasks first
        { priority: "desc" }, // HIGH -> MEDIUM -> LOW
        { createdAt: "desc" },
      ],
    });

    return tasks;
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

    const priorityStats = await prisma.task.groupBy({
      by: ["priority"],
      where: { userId, isDone: false },
      _count: { priority: true },
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
    };
  }
}

export const TaskService = new TaskServiceClass();
