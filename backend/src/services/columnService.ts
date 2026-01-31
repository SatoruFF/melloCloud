import { prisma } from "../configs/config.js";
import { ResourceType } from "@prisma/client";
import _ from "lodash";
import "dotenv/config.js";
import createError from "http-errors";
import { SharingService } from "./sharingService.js";

interface IColumnData {
  title: string;
  color: string;
  userId: number;
  boardId: number;
}

interface IColumnUpdate {
  title?: string;
  color?: string;
  order?: number;
}

class ColumnServiceClass {
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

  async create({ title, color, userId, boardId }: IColumnData) {
    await this.ensureBoardAccess(boardId, userId);
    return prisma.$transaction(async (trx) => {
      if (!title) {
        throw createError(400, "Title is required");
      }
      const maxOrder = await trx.taskColumn.findFirst({
        where: { boardId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      const nextOrder = maxOrder ? maxOrder.order + 1 : 0;
      const column = await trx.taskColumn.create({
        data: {
          title,
          color,
          order: nextOrder,
          boardId,
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

  /** All columns for user (any board) — for backward compatibility */
  async getAll(userId: number) {
    const columns = await prisma.taskColumn.findMany({
      where: { userId },
      include: {
        tasks: {
          orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
        },
      },
      orderBy: { order: "asc" },
    });
    return columns;
  }

  /** Columns for a specific board (checks board access) */
  async getByBoardId(boardId: number, userId: number) {
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
    const column = await prisma.taskColumn.findFirst({
      where: { id },
      include: {
        tasks: {
          orderBy: [{ isDone: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
        },
      },
    });
    if (!column) return null;
    await this.ensureBoardAccess(column.boardId, userId);
    return column;
  }

  async update(id: number, userId: number, updateData: IColumnUpdate) {
    const existingColumn = await prisma.taskColumn.findUnique({
      where: { id },
    });
    if (!existingColumn) throw createError(404, "Column not found");
    await this.ensureBoardAccess(existingColumn.boardId, userId);

    return prisma.$transaction(async (trx) => {
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
    const existingColumn = await prisma.taskColumn.findUnique({
      where: { id },
    });
    if (!existingColumn) throw createError(404, "Column not found");
    await this.ensureBoardAccess(existingColumn.boardId, userId);

    return prisma.$transaction(async (trx) => {
      const columnCount = await trx.taskColumn.count({
        where: { boardId: existingColumn.boardId },
      });
      if (columnCount <= 1) {
        throw createError(400, "Cannot delete the last column");
      }
      const firstColumn = await trx.taskColumn.findFirst({
        where: {
          boardId: existingColumn.boardId,
          id: { not: id },
        },
        orderBy: { order: "asc" },
      });

      if (firstColumn) {
        await trx.task.updateMany({
          where: { columnId: id },
          data: { columnId: firstColumn.id },
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

  async reorderColumns(
    userId: number,
    columnOrders: Array<{ id: number; order: number }>,
    boardId: number
  ) {
    await this.ensureBoardAccess(boardId, userId);
    return prisma.$transaction(async (trx) => {
      for (const { id, order } of columnOrders) {
        await trx.taskColumn.updateMany({
          where: { id, boardId },
          data: { order },
        });
      }
      const columns = await trx.taskColumn.findMany({
        where: { boardId },
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

  async moveTask(taskId: number, columnId: number, userId: number) {
    const [task, column] = await Promise.all([
      prisma.task.findFirst({
        where: { id: taskId },
        include: { column: true },
      }),
      prisma.taskColumn.findFirst({
        where: { id: columnId },
      }),
    ]);
    if (!task) throw createError(404, "Task not found");
    if (!column) throw createError(404, "Column not found");
    const taskBoardId = task.column?.boardId ?? column.boardId;
    if (column.boardId !== taskBoardId) {
      throw createError(400, "Task and column must be on the same board");
    }
    await this.ensureBoardAccess(column.boardId, userId);

    return prisma.$transaction(async (trx) => {
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

  async getColumnStats(userId: number, boardId: number) {
    await this.ensureBoardAccess(boardId, userId);
    const columns = await prisma.taskColumn.findMany({
      where: { boardId },
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
