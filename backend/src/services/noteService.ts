import createError from "http-errors";
import { ResourceType, PermissionLevel } from "@prisma/client";
import { parseJson, stringify } from "../helpers/parseJson.js";
import { SharingService } from "./sharingService.js";

//
// content <-> text(JSON)
//
const mapContent = <T extends { content: any }>(
  data: T | T[],
  to: "text" | "object" = "object"
): any => {
  const mappers = {
    text: stringify,     // object -> string
    object: parseJson,   // string -> object
  } as const;

  if (Array.isArray(data)) {
    return data.map((note) => ({
      ...note,
      content: mappers[to](note.content),
    }));
  }

  return {
    ...data,
    content: mappers[to](data.content),
  };
};

class NotesServiceClass {
  //
  // GET MANY — свои заметки + расшаренные с пользователем
  //
  async getUserNotes(context, userId: number) {
    const sharedPermissionIds = await context.prisma.permission.findMany({
      where: {
        resourceType: ResourceType.NOTE,
        subjectId: userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { resourceId: true },
    });
    const sharedIds = sharedPermissionIds.map((p) => p.resourceId);

    const notes = await context.prisma.note.findMany({
      where: {
        OR: [{ userId }, { id: { in: sharedIds } }],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isStarred: true,
        tags: true,
      },
    });

    return mapContent(notes, "object");
  }

  //
  // GET ONE — доступ владельцу или по Permission
  //
  async getNote(context, noteId: string, userId: number) {
    let note = await context.prisma.note.findFirst({
      where: { id: +noteId, userId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isStarred: true,
        tags: true,
      },
    });

    if (!note) {
      const { hasAccess } = await SharingService.checkUserPermission(userId, ResourceType.NOTE, +noteId);
      if (!hasAccess) {
        throw createError(404, "Note not found");
      }
      note = await context.prisma.note.findFirst({
        where: { id: +noteId },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          isStarred: true,
          tags: true,
        },
      });
    }

    if (!note) {
      throw createError(404, "Note not found");
    }

    return mapContent(note, "object");
  }

  //
  // CREATE
  //
  async createNote(
    context,
    userId: number,
    data: { title: string; content: any; tags?: string[] }
  ) {
    const note = await context.prisma.note.create({
      data: {
        title: data.title,
        content: stringify(data.content), // object -> string
        tags: data.tags || [], // +++
        userId,
      },
    });

    return mapContent(note, "object"); // string -> object
  }

  //
  // UPDATE — владелец или EDITOR/ADMIN/OWNER
  //
  async updateNote(
    context,
    noteId: string,
    userId: number,
    data: { title?: string; content?: any; isStarred?: boolean; tags?: string[] }
  ) {
    let existingNote = await context.prisma.note.findFirst({
      where: { id: +noteId, userId },
    });

    if (!existingNote) {
      const { hasAccess, permissionLevel } = await SharingService.checkUserPermission(
        userId,
        ResourceType.NOTE,
        +noteId
      );
      const canEdit = [PermissionLevel.EDITOR, PermissionLevel.ADMIN, PermissionLevel.OWNER].includes(
        permissionLevel!
      );
      if (!hasAccess || !canEdit) {
        throw createError(404, "Note not found");
      }
      existingNote = await context.prisma.note.findFirst({
        where: { id: +noteId },
      });
    }

    if (!existingNote) {
      throw createError(404, "Note not found");
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Обновляем только переданные поля
    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.content !== undefined) {
      updateData.content = stringify(data.content);
    }

    if (data.isStarred !== undefined) {
      updateData.isStarred = data.isStarred;
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
 
    }

    const note = await context.prisma.note.update({
      where: { id: +noteId },
      data: updateData,
    });

    return mapContent(note, "object"); // string -> object
  }

  //
  // DELETE — только владелец или ADMIN/OWNER
  //
  async deleteNote(context, noteId: string, userId: number) {
    let existingNote = await context.prisma.note.findFirst({
      where: { id: +noteId, userId },
    });

    if (!existingNote) {
      const { hasAccess, permissionLevel } = await SharingService.checkUserPermission(
        userId,
        ResourceType.NOTE,
        +noteId
      );
      const canDelete = [PermissionLevel.ADMIN, PermissionLevel.OWNER].includes(permissionLevel!);
      if (!hasAccess || !canDelete) {
        throw createError(404, "Note not found");
      }
      existingNote = await context.prisma.note.findFirst({
        where: { id: +noteId },
      });
    }

    if (!existingNote) {
      throw createError(404, "Note not found");
    }

    await context.prisma.note.delete({
      where: { id: +noteId },
    });

    return { message: "Note deleted successfully" };
  }

  //
  // SEARCH — свои + расшаренные
  //
  async searchNotes(context, userId: number, query: string) {
    const sharedPermissionIds = await context.prisma.permission.findMany({
      where: {
        resourceType: ResourceType.NOTE,
        subjectId: userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { resourceId: true },
    });
    const sharedIds = sharedPermissionIds.map((p) => p.resourceId);

    const notes = await context.prisma.note.findMany({
      where: {
        AND: [
          { OR: [{ userId: +userId }, { id: { in: sharedIds } }] },
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { path: [], string_contains: query } },
              { tags: { has: query } },
            ],
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isStarred: true,
        tags: true,
      },
    });

    return mapContent(notes, "object");
  }
}

export const NotesService = new NotesServiceClass();
