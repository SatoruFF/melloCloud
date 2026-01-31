import { prisma } from "../configs/config.js";
import { ResourceType, PermissionLevel } from "@prisma/client";
import createError from "http-errors";
import { SharingService } from "./sharingService.js";

interface IBoardCreate {
  title: string;
  userId: number;
}

interface IBoardUpdate {
  title?: string;
}

class BoardServiceClass {
  async create({ title, userId }: IBoardCreate) {
    if (!title?.trim()) {
      throw createError(400, "Title is required");
    }
    const board = await prisma.kanbanBoard.create({
      data: {
        title: title.trim(),
        userId,
      },
    });
    return board;
  }

  /** Boards where user is owner or has permission (shared with me) */
  async getAll(userId: number) {
    const [ownBoards, sharedPermissionIds] = await Promise.all([
      prisma.kanbanBoard.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.permission
        .findMany({
          where: {
            subjectId: userId,
            resourceType: ResourceType.KANBAN_BOARD,
            ...(await this.expiredFilter()),
          },
          select: { resourceId: true },
        })
        .then((rows) => rows.map((r) => r.resourceId)),
    ]);

    const sharedIds = sharedPermissionIds.filter(
      (id) => !ownBoards.some((b) => b.id === id)
    );
    if (sharedIds.length === 0) {
      return ownBoards.map((b) => ({ ...b, isOwner: true }));
    }

    const sharedBoards = await prisma.kanbanBoard.findMany({
      where: { id: { in: sharedIds } },
      orderBy: { updatedAt: "desc" },
    });

    const combined = [
      ...ownBoards.map((b) => ({ ...b, isOwner: true })),
      ...sharedBoards.map((b) => ({ ...b, isOwner: false })),
    ].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return combined;
  }

  private async expiredFilter() {
    return {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };
  }

  async getById(id: number, userId: number) {
    const { hasAccess } = await SharingService.checkUserPermission(
      userId,
      ResourceType.KANBAN_BOARD,
      id
    );
    if (!hasAccess) {
      throw createError(404, "Board not found");
    }
    const board = await prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, userName: true, email: true, avatar: true },
        },
      },
    });
    if (!board) {
      throw createError(404, "Board not found");
    }
    const isOwner = board.userId === userId;
    return { ...board, isOwner };
  }

  async update(id: number, userId: number, data: IBoardUpdate) {
    const { hasAccess, permissionLevel } = await SharingService.checkUserPermission(
      userId,
      ResourceType.KANBAN_BOARD,
      id
    );
    if (!hasAccess) {
      throw createError(404, "Board not found");
    }
    const canEdit =
      permissionLevel === PermissionLevel.OWNER ||
      permissionLevel === PermissionLevel.ADMIN ||
      permissionLevel === PermissionLevel.EDITOR;
    if (!canEdit) {
      throw createError(403, "You do not have permission to edit this board");
    }
    const board = await prisma.kanbanBoard.update({
      where: { id },
      data: data.title !== undefined ? { title: data.title.trim() } : {},
    });
    return board;
  }

  async delete(id: number, userId: number) {
    const board = await prisma.kanbanBoard.findUnique({
      where: { id },
    });
    if (!board) {
      throw createError(404, "Board not found");
    }
    if (board.userId !== userId) {
      throw createError(403, "Only the board owner can delete the board");
    }
    await prisma.kanbanBoard.delete({
      where: { id },
    });
    return { message: "Board deleted successfully" };
  }
}

export const BoardService = new BoardServiceClass();
