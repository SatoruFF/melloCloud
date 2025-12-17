import createError from "http-errors";
import { v4 as uuidv4 } from "uuid";

class NotesServiceClass {
  async getUserNotes(context, userId: number) {
    const notes = await context.prisma.note.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    return notes;
  }

  async getNote(context, noteId: string, userId: number) {
    const note = await context.prisma.note.findFirst({
      where: {
        id: noteId,
        userId, // Ensure user can only access their own notes
      },
    });

    if (!note) {
      throw createError(404, "Note not found");
    }

    return note;
  }

  async createNote(context, userId: number, data: { title: string; content: any }) {
    const note = await context.prisma.note.create({
      data: {
        id: uuidv4(),
        title: data.title,
        content: data.content,
        userId,
      },
    });

    return note;
  }

  async updateNote(context, noteId: string, userId: number, data: { title?: string; content?: any }) {
    // Check if note exists and belongs to user
    const existingNote = await context.prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!existingNote) {
      throw createError(404, "Note not found");
    }

    const note = await context.prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return note;
  }

  async deleteNote(context, noteId: string, userId: number) {
    // Check if note exists and belongs to user
    const existingNote = await context.prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!existingNote) {
      throw createError(404, "Note not found");
    }

    await context.prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    return { message: "Note deleted successfully" };
  }

  async searchNotes(context, userId: number, query: string) {
    const notes = await context.prisma.note.findMany({
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
              path: [],
              string_contains: query,
            },
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return notes;
  }
}

export const NotesService = new NotesServiceClass();
