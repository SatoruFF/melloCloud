import createError from "http-errors";
import { parseJson, stringify } from "../helpers/parseJson.js";

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
  // GET MANY
  //
  async getUserNotes(context, userId: number) {
    const notes = await context.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isStarred: true, // +++
        tags: true,      // +++
      },
    });

    return mapContent(notes, "object"); // string -> object
  }

  //
  // GET ONE
  //
  async getNote(context, noteId: string, userId: number) {
    const note = await context.prisma.note.findFirst({
      where: { id: +noteId, userId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isStarred: true, // +++
        tags: true,      // +++
      },
    });

    if (!note) {
      throw createError(404, "Note not found");
    }

    return mapContent(note, "object"); // string -> object
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
  // UPDATE
  //
  async updateNote(
    context,
    noteId: string,
    userId: number,
    data: { title?: string; content?: any; isStarred?: boolean; tags?: string[] }
  ) {
    const existingNote = await context.prisma.note.findFirst({
      where: { id: +noteId, userId },
    });

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
  // DELETE
  //
  async deleteNote(context, noteId: string, userId: number) {
    const existingNote = await context.prisma.note.findFirst({
      where: { id: +noteId, userId },
    });

    if (!existingNote) {
      throw createError(404, "Note not found");
    }

    await context.prisma.note.delete({
      where: { id: +noteId },
    });

    return { message: "Note deleted successfully" };
  }

  //
  // SEARCH
  //
  async searchNotes(context, userId: number, query: string) {
    const notes = await context.prisma.note.findMany({
      where: {
        userId: +userId,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              path: [],
              string_contains: query,
            },
          },
          {
            tags: {
              has: query, // поиск по тегам +++
            },
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
        isStarred: true, // +++
        tags: true,      // +++
      },
    });

    return mapContent(notes, "object"); // string -> object
  }
}

export const NotesService = new NotesServiceClass();
