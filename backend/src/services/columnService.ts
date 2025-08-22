import { prisma } from "../configs/config.js";
import _ from "lodash";
import "dotenv/config.js";
import createError from "http-errors";

interface IColumnData {
  title: string;
  color: string;
  userId: number;
}

interface IColumnUpdate {
  title?: string;
  color?: string;
  order?: number;
}

class ColumnServiceClass {
  async create({ title, color, userId }: IColumnData) {
    return prisma.$transaction(async (trx) => {
      // Validate required fields
      if (!title) {
        throw createError(400, "Title is required");
      }

      // Get current max order for this user
      const maxOrder = await trx.taskColumn.findFirst({
        where: { userId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

      const column = await trx.taskColumn.create({
        data: {
          title,
          color,
          order: nextOrder,
          userId,
        },
        include: {
          tasks: {
            orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      return column;
    });
  }

  async getAll(userId: number) {
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
    const column = await prisma.taskColumn.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        tasks: {
          orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    return column;
  }

  async update(id: number, userId: number, updateData: IColumnUpdate) {
    return prisma.$transaction(async (trx) => {
      // First check if column exists and belongs to user
      const existingColumn = await trx.taskColumn.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingColumn) {
        throw createError(404, "Column not found");
      }

      const column = await trx.taskColumn.update({
        where: {
          id,
        },
        data: updateData,
        include: {
          tasks: {
            orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      return column;
    });
  }

  async delete(id: number, userId: number) {
    return prisma.$transaction(async (trx) => {
      // First check if column exists and belongs to user
      const existingColumn = await trx.taskColumn.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingColumn) {
        throw createError(404, "Column not found");
      }

      // Check if user has more than one column
      const columnCount = await trx.taskColumn.count({
        where: { userId },
      });

      if (columnCount <= 1) {
        throw createError(400, "Cannot delete the last column");
      }

      // Move all tasks from this column to the first available column
      const firstColumn = await trx.taskColumn.findFirst({
        where: {
          userId,
          id: { not: id },
        },
        orderBy: { order: "asc" },
      });

      if (firstColumn) {
        await trx.task.updateMany({
          where: {
            columnId: id,
            userId,
          },
          data: {
            columnId: firstColumn.id,
          },
        });
      }

      await trx.taskColumn.delete({
        where: {
          id,
        },
      });

      return { message: "Column deleted successfully" };
    });
  }

  async reorderColumns(userId: number, columnOrders: Array<{ id: number; order: number }>) {
    return prisma.$transaction(async (trx) => {
      // Update all column orders
      for (const { id, order } of columnOrders) {
        await trx.taskColumn.updateMany({
          where: {
            id,
            userId, // Ensure user can only reorder their own columns
          },
          data: {
            order,
          },
        });
      }

      // Return updated columns
      const columns = await trx.taskColumn.findMany({
        where: { userId },
        include: {
          tasks: {
            orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
          },
        },
        orderBy: { order: "asc" },
      });

      return columns;
    });
  }

  // Move task between columns
  async moveTask(taskId: number, columnId: number, userId: number) {
    return prisma.$transaction(async (trx) => {
      // Verify both task and column belong to the user
      const [task, column] = await Promise.all([
        trx.task.findFirst({
          where: { id: taskId, userId },
        }),
        trx.taskColumn.findFirst({
          where: { id: columnId, userId },
        }),
      ]);

      if (!task) {
        throw createError(404, "Task not found");
      }

      if (!column) {
        throw createError(404, "Column not found");
      }

      // Update task's column
      const updatedTask = await trx.task.update({
        where: { id: taskId },
        data: { columnId },
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

      return updatedTask;
    });
  }

  // Get column statistics
  async getColumnStats(userId: number) {
    const columns = await prisma.taskColumn.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: {
          select: {
            priority: true,
            isDone: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return columns.map((column) => ({
      id: column.id,
      title: column.title,
      color: column.color,
      order: column.order,
      totalTasks: column._count.tasks,
      completedTasks: column.tasks.filter((task) => task.isDone).length,
      pendingTasks: column.tasks.filter((task) => !task.isDone).length,
      priorityBreakdown: {
        high: column.tasks.filter((task) => task.priority === "HIGH").length,
        medium: column.tasks.filter((task) => task.priority === "MEDIUM").length,
        low: column.tasks.filter((task) => task.priority === "LOW").length,
      },
    }));
  }
}

export const ColumnService = new ColumnServiceClass();
