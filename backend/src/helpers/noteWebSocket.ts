import type { Prisma } from "@prisma/client";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { logger } from "../configs/logger.js";
import { parseJson } from "./parseJson.js";
import ApiContext from "../models/context.js";
import { ACCESS_SECRET_KEY, prisma } from "../configs/config.js";

interface NoteClient {
  ws: WebSocket;
  userId: number;
  noteId: number;
  userName: string;
  userAvatar?: string;
  color: string;
}

const noteRooms = new Map<number, Set<NoteClient>>();

const generateUserColor = (userId: number): string => {
  const colors = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#13c2c2", "#eb2f96", "#fa8c16"];
  return colors[userId % colors.length];
};

export function setupNoteWebSocket(wss: WebSocketServer) {
  wss.on("connection", async (ws: WebSocket, request) => {
    let context: ApiContext | undefined;
    let currentNoteId: number | null = null;
    let userId: number;
    let client: NoteClient;

    try {
      const token = request.headers["sec-websocket-protocol"];

      if (!token || Array.isArray(token)) {
        ws.close(1008, "Unauthorized");
        return;
      }

      const decoded = jwt.verify(token, ACCESS_SECRET_KEY) as
        | { payload?: number; id?: number }
        | number;
      const rawId =
        typeof decoded === "object" && decoded !== null
          ? (decoded.payload ?? decoded.id)
          : decoded;
      userId = Number(rawId);
      context = new ApiContext(userId);

      logger.info(`[NoteWS] User ${userId} connected`);
    } catch (err) {
      logger.error("[NoteWS] Auth error:", err);
      ws.close(1008, "Invalid token");
      return;
    }

    ws.on("message", async (message) => {
      try {
        const data = parseJson(message.toString());
        const { action, noteId, payload } = data;

        switch (action) {
          case "join_note":
            await handleJoinNote(ws, context!, userId, noteId, payload);
            currentNoteId = noteId;
            break;

          case "leave_note":
            await handleLeaveNote(userId, noteId);
            currentNoteId = null;
            break;

          case "cursor_update":
            await handleCursorUpdate(userId, noteId, payload);
            break;

          case "selection_update":
            await handleSelectionUpdate(userId, noteId, payload);
            break;

          case "content_change":
            await handleContentChange(context!, userId, noteId, payload);
            break;

          case "get_history":
            await handleGetHistory(ws, noteId, payload);
            break;

          case "heartbeat":
            await handleHeartbeat(userId, noteId);
            break;

          default:
            logger.warn(`[NoteWS] Unknown action: ${action}`);
        }
      } catch (error) {
        logger.error("[NoteWS] Error handling message:", error);
        ws.send(
          JSON.stringify({
            action: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
        );
      }
    });

    ws.on("close", async () => {
      if (currentNoteId) {
        await handleLeaveNote(userId, currentNoteId);
      }
      logger.info(`[NoteWS] User ${userId} disconnected`);
    });

    ws.on("error", (err) => {
      logger.error("[NoteWS] WebSocket error:", err);
    });
  });
}

async function handleJoinNote(
  ws: WebSocket,
  context: ApiContext,
  userId: number,
  noteId: number,
  payload: unknown,
) {
  try {
    const hasAccess = await checkNoteAccess(context, userId, noteId);

    if (!hasAccess) {
      ws.send(
        JSON.stringify({
          action: "error",
          message: "Access denied to this note",
        }),
      );
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userName: true, avatar: true },
    });

    const color = generateUserColor(userId);

    await prisma.noteCollaborator.upsert({
      where: { noteId_userId: { noteId, userId } },
      create: {
        noteId,
        userId,
        color,
        isActive: true,
        lastActivity: new Date(),
      },
      update: {
        isActive: true,
        lastActivity: new Date(),
      },
    });

    const client: NoteClient = {
      ws,
      userId,
      noteId,
      userName: user?.userName || `User${userId}`,
      userAvatar: user?.avatar ?? undefined,
      color,
    };

    if (!noteRooms.has(noteId)) {
      noteRooms.set(noteId, new Set());
    }
    noteRooms.get(noteId)!.add(client);

    const collaborators = await prisma.noteCollaborator.findMany({
      where: {
        noteId,
        isActive: true,
        lastActivity: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: { userName: true, avatar: true },
        },
      },
    });

    ws.send(
      JSON.stringify({
        action: "joined",
        noteId,
        userId,
        color,
        collaborators: collaborators.map((c) => ({
          userId: c.userId,
          userName: c.user.userName,
          avatar: c.user.avatar,
          color: c.color,
          cursorPosition: c.cursorPosition,
          selection: c.selection,
        })),
      }),
    );

    broadcastToRoom(
      noteId,
      {
        action: "user_joined",
        user: {
          userId,
          userName: client.userName,
          avatar: client.userAvatar,
          color,
        },
      },
      userId,
    );

    logger.info(`[NoteWS] User ${userId} joined note ${noteId}`);
  } catch (error) {
    logger.error("[NoteWS] Error joining note:", error);
    throw error;
  }
}

async function handleLeaveNote(userId: number, noteId: number) {
  try {
    await prisma.noteCollaborator.updateMany({
      where: { noteId, userId },
      data: {
        isActive: false,
        cursorPosition: null,
        selection: null,
      },
    });

    const room = noteRooms.get(noteId);
    if (room) {
      for (const client of room) {
        if (client.userId === userId) {
          room.delete(client);
          break;
        }
      }

      if (room.size === 0) {
        noteRooms.delete(noteId);
      }
    }

    broadcastToRoom(
      noteId,
      {
        action: "user_left",
        userId,
      },
      userId,
    );

    logger.info(`[NoteWS] User ${userId} left note ${noteId}`);
  } catch (error) {
    logger.error("[NoteWS] Error leaving note:", error);
  }
}

async function handleCursorUpdate(userId: number, noteId: number, payload: { line?: number; column?: number }) {
  const { line, column } = payload ?? {};

  try {
    await prisma.noteCollaborator.updateMany({
      where: { noteId, userId },
      data: {
        cursorPosition: line !== undefined && column !== undefined ? { line, column } : undefined,
        lastActivity: new Date(),
      },
    });

    broadcastToRoom(
      noteId,
      {
        action: "cursor_moved",
        userId,
        position: { line, column },
      },
      userId,
    );
  } catch (error) {
    logger.error("[NoteWS] Error updating cursor:", error);
  }
}

async function handleSelectionUpdate(
  userId: number,
  noteId: number,
  payload: { from?: unknown; to?: unknown },
) {
  const { from, to } = payload ?? {};

  try {
    await prisma.noteCollaborator.updateMany({
      where: { noteId, userId },
      data: {
        selection:
          from !== undefined && to !== undefined
            ? ({ from, to } as Prisma.InputJsonValue)
            : undefined,
        lastActivity: new Date(),
      },
    });

    broadcastToRoom(
      noteId,
      {
        action: "selection_changed",
        userId,
        selection: { from, to },
      },
      userId,
    );
  } catch (error) {
    logger.error("[NoteWS] Error updating selection:", error);
  }
}

async function handleContentChange(
  context: ApiContext,
  userId: number,
  noteId: number,
  payload: { operation?: string; data?: unknown; version?: number },
) {
  const { operation, data, version } = payload ?? {};

  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { version: true, content: true },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    if (version !== undefined && note.version !== version) {
      logger.warn(`[NoteWS] Version conflict: expected ${version}, got ${note.version}`);

      broadcastToRoom(
        noteId,
        {
          action: "conflict",
          userId,
          serverVersion: note.version,
        },
        -1,
      );
      return;
    }

    const newContent = applyOperation(note.content, operation ?? "", data);
    const newVersion = note.version + 1;

    await prisma.note.update({
      where: { id: noteId },
      data: {
        content: JSON.stringify(newContent),
        version: newVersion,
        updatedAt: new Date(),
      },
    });

    await prisma.noteHistory.create({
      data: {
        noteId,
        userId,
        operation: operation ?? "REPLACE",
        data: (data as object) ?? {},
        version: newVersion,
        previousVersion: note.version,
      },
    });

    broadcastToRoom(
      noteId,
      {
        action: "content_updated",
        userId,
        operation,
        data,
        version: newVersion,
        timestamp: new Date().toISOString(),
      },
      userId,
    );

    logger.info(`[NoteWS] Content updated: note ${noteId}, version ${newVersion}`);
  } catch (error) {
    logger.error("[NoteWS] Error updating content:", error);
    throw error;
  }
}

async function handleHeartbeat(userId: number, noteId: number) {
  try {
    await prisma.noteCollaborator.updateMany({
      where: { noteId, userId },
      data: { lastActivity: new Date() },
    });
  } catch (error) {
    logger.error("[NoteWS] Heartbeat error:", error);
  }
}

async function handleGetHistory(
  ws: WebSocket,
  noteId: number,
  payload: { limit?: number; offset?: number },
) {
  try {
    const { limit = 50, offset = 0 } = payload ?? {};

    const history = await prisma.noteHistory.findMany({
      where: { noteId },
      orderBy: { version: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { userName: true, avatar: true },
        },
      },
    });

    ws.send(
      JSON.stringify({
        action: "history_loaded",
        history,
      }),
    );
  } catch (error) {
    logger.error("[NoteWS] Error loading history:", error);
  }
}

async function checkNoteAccess(context: ApiContext, userId: number, noteId: number): Promise<boolean> {
  try {
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (note) return true;

    const permission = await prisma.permission.findFirst({
      where: {
        resourceType: "NOTE",
        resourceId: noteId,
        subjectId: userId,
      },
    });

    return !!permission;
  } catch (error) {
    logger.error("[NoteWS] Error checking access:", error);
    return false;
  }
}

function broadcastToRoom(noteId: number, message: object, excludeUserId?: number) {
  const room = noteRooms.get(noteId);

  if (!room) return;

  const messageStr = JSON.stringify(message);

  for (const client of room) {
    if (excludeUserId !== undefined && client.userId === excludeUserId) {
      continue;
    }

    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  }
}

function applyOperation(content: string | object, operation: string, data: unknown): unknown {
  const contentObj = typeof content === "string" ? JSON.parse(content) : content;

  switch (operation) {
    case "INSERT":
      return insertText(contentObj as unknown[], data as { blockIndex: number; position: number; text: string });

    case "DELETE":
      return deleteText(
        contentObj as unknown[],
        data as { blockIndex: number; position: number; length: number },
      );

    case "UPDATE_BLOCK":
      return updateBlock(contentObj as unknown[], data as { blockIndex: number; newBlock: unknown });

    case "REPLACE":
      return (data as { newContent: unknown }).newContent;

    default:
      return contentObj;
  }
}

function insertText(
  content: unknown[],
  data: { blockIndex: number; position: number; text: string },
): unknown[] {
  const { blockIndex, position, text } = data;

  if (!content[blockIndex] || typeof content[blockIndex] !== "object") return content;

  const block = { ...(content[blockIndex] as object) } as { content?: string };
  const blockText = block.content || "";

  block.content = blockText.slice(0, position) + text + blockText.slice(position);

  return [...content.slice(0, blockIndex), block, ...content.slice(blockIndex + 1)];
}

function deleteText(
  content: unknown[],
  data: { blockIndex: number; position: number; length: number },
): unknown[] {
  const { blockIndex, position, length } = data;

  if (!content[blockIndex] || typeof content[blockIndex] !== "object") return content;

  const block = { ...(content[blockIndex] as object) } as { content?: string };
  const blockText = block.content || "";

  block.content = blockText.slice(0, position) + blockText.slice(position + length);

  return [...content.slice(0, blockIndex), block, ...content.slice(blockIndex + 1)];
}

function updateBlock(content: unknown[], data: { blockIndex: number; newBlock: unknown }): unknown[] {
  const { blockIndex, newBlock } = data;

  return [...content.slice(0, blockIndex), newBlock, ...content.slice(blockIndex + 1)];
}

setInterval(async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    await prisma.noteCollaborator.updateMany({
      where: {
        lastActivity: { lt: fiveMinutesAgo },
        isActive: true,
      },
      data: {
        isActive: false,
        cursorPosition: null,
        selection: null,
      },
    });
  } catch (error) {
    logger.error("[NoteWS] Cleanup error:", error);
  }
}, 60 * 1000);
