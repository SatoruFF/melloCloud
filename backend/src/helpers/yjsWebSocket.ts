import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import jwt from "jsonwebtoken";
import { logger } from "../configs/logger.js";
import ApiContext from "../models/context.js";
import { ACCESS_SECRET_KEY, prisma } from "../configs/config.js";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

// Константы для протокола Yjs
const messageSync = 0;
const messageAwareness = 1;

interface YjsClient {
  ws: WebSocket;
  userId: number;
  noteId: number;
  userName: string;
  userAvatar?: string;
  color: string;
  doc: Y.Doc;
  awareness: Map<number, any>;
  awarenessClientId: number;
}

// Хранилище Y.Doc для каждой заметки
const noteDocs = new Map<number, Y.Doc>();
const noteRooms = new Map<number, Set<YjsClient>>();
let awarenessClientIdCounter = 0;

const generateUserColor = (userId: number): string => {
  const colors = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#13c2c2", "#eb2f96", "#fa8c16"];
  return colors[userId % colors.length];
};

/**
 * Получить или создать Y.Doc для заметки
 */
async function getOrCreateNoteDoc(noteId: number): Promise<Y.Doc> {
  if (!noteDocs.has(noteId)) {
    const doc = new Y.Doc();

    // Загрузить контент из БД при первом создании
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { content: true },
    });

    if (note?.content) {
      try {
        const content = typeof note.content === "string" ? JSON.parse(note.content) : note.content;
        // Инициализировать Y.Doc с существующим контентом
        if (Array.isArray(content)) {
          // Для BlockNote контента используем Y.Array
          const yArray = doc.getArray("blocks");
          yArray.insert(0, content);
        }
      } catch (error) {
        logger.error(`[YjsWS] Error loading note ${noteId} content:`, error);
      }
    }

    // Дебаунс для сохранения изменений в БД
    let saveTimeout: NodeJS.Timeout | null = null;
    doc.on("update", async (update: Uint8Array) => {
      if (saveTimeout) clearTimeout(saveTimeout);

      saveTimeout = setTimeout(async () => {
        try {
          const yArray = doc.getArray("blocks");
          const content = yArray.toArray();
          await prisma.note.update({
            where: { id: noteId },
            data: {
              content: JSON.stringify(content),
              updatedAt: new Date(),
            },
          });
          logger.debug(`[YjsWS] Saved note ${noteId} to DB`);
        } catch (error) {
          logger.error(`[YjsWS] Error saving note ${noteId}:`, error);
        }
      }, 2000); // Сохранять через 2 секунды после последнего изменения
    });

    noteDocs.set(noteId, doc);
    logger.info(`[YjsWS] Created Y.Doc for note ${noteId}`);
  }

  return noteDocs.get(noteId)!;
}

/**
 * Обработка синхронизации Yjs через WebSocket
 */
function handleYjsSyncMessage(decoder: decoding.Decoder, doc: Y.Doc, client: YjsClient) {
  try {
    const syncMessageType = decoding.readVarUint(decoder);

    if (syncMessageType === 0) {
      // Sync step 1: клиент запрашивает состояние
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      encoding.writeVarUint(encoder, 1); // sync step 2
      const state = Y.encodeStateAsUpdate(doc);
      encoding.writeVarUint8Array(encoder, state);
      const message = encoding.toUint8Array(encoder);
      client.ws.send(message);
    } else if (syncMessageType === 1) {
      // Sync step 2: клиент отправляет состояние
      const update = decoding.readVarUint8Array(decoder);
      Y.applyUpdate(doc, update);
    } else if (syncMessageType === 2) {
      // Update: клиент отправляет обновление
      const update = decoding.readVarUint8Array(decoder);
      Y.applyUpdate(doc, update);
    }
  } catch (error) {
    logger.error("[YjsWS] Error handling sync message:", error);
  }
}

/**
 * Обработка awareness сообщений (курсоры, выделения)
 */
function handleAwarenessMessage(decoder: decoding.Decoder, client: YjsClient, noteId: number) {
  try {
    const awarenessUpdate = decoding.readVarUint8Array(decoder);
    const decoder2 = decoding.createDecoder(awarenessUpdate);
    const added = [];
    const updated = [];
    const removed = [];

    const len = decoding.readVarUint(decoder2);
    for (let i = 0; i < len; i++) {
      const clientId = decoding.readVarUint(decoder2);
      const clock = decoding.readVarUint(decoder2);
      const state = decoding.readVarString(decoder2);

      if (state) {
        try {
          const parsedState = JSON.parse(state);
          client.awareness.set(clientId, parsedState);
          if (!added.includes(clientId)) added.push(clientId);
        } catch (e) {
          // ignore
        }
      } else {
        client.awareness.delete(clientId);
        removed.push(clientId);
      }
    }

    // Отправить обновление awareness всем в комнате кроме отправителя
    if (added.length > 0 || updated.length > 0 || removed.length > 0) {
      broadcastAwarenessToRoom(noteId, awarenessUpdate, client.userId);
    }
  } catch (error) {
    logger.error("[YjsWS] Error handling awareness message:", error);
  }
}

/**
 * Отправка начального состояния Yjs клиенту
 */
function sendInitialState(ws: WebSocket, doc: Y.Doc, awareness: Map<number, any>) {
  if (ws.readyState !== WebSocket.OPEN) return;

  try {
    // Отправить состояние документа
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    encoding.writeVarUint(encoder, 0); // sync step 1 - запрос состояния
    const message = encoding.toUint8Array(encoder);
    ws.send(message);

    // Отправить полное состояние
    const stateEncoder = encoding.createEncoder();
    encoding.writeVarUint(stateEncoder, messageSync);
    encoding.writeVarUint(stateEncoder, 1); // sync step 2
    const state = Y.encodeStateAsUpdate(doc);
    encoding.writeVarUint8Array(stateEncoder, state);
    const stateMessage = encoding.toUint8Array(stateEncoder);
    ws.send(stateMessage);

    // Отправить awareness состояния
    if (awareness.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, messageAwareness);
      const awarenessUpdate = encoding.createEncoder();
      encoding.writeVarUint(awarenessUpdate, awareness.size);
      for (const [clientId, state] of awareness.entries()) {
        encoding.writeVarUint(awarenessUpdate, clientId);
        encoding.writeVarUint(awarenessUpdate, 0); // clock
        encoding.writeVarString(awarenessUpdate, JSON.stringify(state));
      }
      encoding.writeVarUint8Array(awarenessEncoder, encoding.toUint8Array(awarenessUpdate));
      const awarenessMessage = encoding.toUint8Array(awarenessEncoder);
      ws.send(awarenessMessage);
    }
  } catch (error) {
    logger.error("[YjsWS] Error sending initial state:", error);
  }
}

export function setupYjsWebSocket(wss: WebSocketServer) {
  wss.on("connection", async (ws: WebSocket, request) => {
    let context: ApiContext | undefined;
    let userId: number;
    let client: YjsClient | undefined;

    try {
      // Аутентификация через JWT токен
      const token = request.url?.split("token=")[1] || request.headers["sec-websocket-protocol"];

      if (!token || Array.isArray(token)) {
        ws.close(1008, "Unauthorized");
        return;
      }

      const decoded = jwt.verify(token, ACCESS_SECRET_KEY) as { payload?: number; id?: number } | number;
      const rawId = typeof decoded === "object" && decoded !== null ? decoded.payload ?? decoded.id : decoded;
      userId = Number(rawId);
      context = new ApiContext(userId);

      logger.info(`[YjsWS] User ${userId} connected`);
    } catch (err) {
      logger.error("[YjsWS] Auth error:", err);
      ws.close(1008, "Invalid token");
      return;
    }

    ws.on("message", async (message: Buffer) => {
      try {
        // Первое сообщение - join_note с noteId (текстовое JSON)
        if (!client) {
          try {
            const data = JSON.parse(message.toString());
            if (data.action === "join_note" && data.noteId) {
              const noteId = Number(data.noteId);

              // Проверка доступа
              const hasAccess = await checkNoteAccess(context!, userId, noteId);
              if (!hasAccess) {
                ws.send(JSON.stringify({ action: "error", message: "Access denied" }));
                ws.close(1008, "Access denied");
                return;
              }

              // Получить или создать Y.Doc
              const doc = await getOrCreateNoteDoc(noteId);

              // Получить информацию о пользователе
              const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { userName: true, avatar: true },
              });

              const color = generateUserColor(userId);
              const awarenessClientId = awarenessClientIdCounter++;

              // Создать awareness для отслеживания курсоров и выделений
              const awareness = new Map<number, any>();
              awareness.set(awarenessClientId, {
                userId,
                userName: user?.userName || `User${userId}`,
                avatar: user?.avatar,
                color,
              });

              client = {
                ws,
                userId,
                noteId,
                userName: user?.userName || `User${userId}`,
                userAvatar: user?.avatar ?? undefined,
                color,
                doc,
                awareness,
                awarenessClientId,
              };

              // Добавить в комнату
              if (!noteRooms.has(noteId)) {
                noteRooms.set(noteId, new Set());
              }
              noteRooms.get(noteId)!.add(client);

              // Отправить начальное состояние
              sendInitialState(ws, doc, awareness);

              // Отправить информацию о коллабораторах
              const collaborators = Array.from(noteRooms.get(noteId) || [])
                .filter((c) => c.userId !== userId)
                .map((c) => ({
                  userId: c.userId,
                  userName: c.userName,
                  avatar: c.userAvatar,
                  color: c.color,
                }));

              ws.send(
                JSON.stringify({
                  action: "joined",
                  noteId,
                  collaborators,
                })
              );

              // Уведомить других о новом пользователе
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
                userId
              );

              // Обработка изменений документа - транслировать всем кроме отправителя
              const updateHandler = (update: Uint8Array, origin: any) => {
                if (origin !== client) {
                  // Обновление от другого клиента, транслируем
                  broadcastYjsToRoom(noteId, update, userId);
                }
              };
              doc.on("update", updateHandler);

              logger.info(`[YjsWS] User ${userId} joined note ${noteId}`);
            }
          } catch (e) {
            // Не JSON сообщение, возможно бинарное Yjs сообщение
            // Но клиент еще не присоединился, игнорируем
          }
          return;
        }

        // Обработка Yjs сообщений (бинарные данные)
        if (client && message instanceof Buffer) {
          const decoder = decoding.createDecoder(new Uint8Array(message));
          const messageType = decoding.readVarUint(decoder);

          switch (messageType) {
            case messageSync:
              handleYjsSyncMessage(decoder, client.doc, client);
              // После обработки синхронизации, транслируем обновления другим
              const update = Y.encodeStateAsUpdate(client.doc);
              broadcastYjsToRoom(client.noteId, update, client.userId);
              break;

            case messageAwareness:
              handleAwarenessMessage(decoder, client, client.noteId);
              break;

            default:
              logger.warn(`[YjsWS] Unknown message type: ${messageType}`);
          }
        }
      } catch (error) {
        logger.error("[YjsWS] Error handling message:", error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "error", message: "Failed to process message" }));
        }
      }
    });

    ws.on("close", async () => {
      if (client) {
        const { noteId, userId } = client;

        // Удалить из комнаты
        const room = noteRooms.get(noteId);
        if (room) {
          room.delete(client);
          if (room.size === 0) {
            noteRooms.delete(noteId);
          }
        }

        // Уведомить других
        broadcastToRoom(
          noteId,
          {
            action: "user_left",
            userId,
          },
          userId
        );

        logger.info(`[YjsWS] User ${userId} left note ${noteId}`);
      }
    });

    ws.on("error", (err) => {
      logger.error("[YjsWS] WebSocket error:", err);
    });
  });

  logger.info("[YjsWS] Yjs WebSocket server is running");
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
    logger.error("[YjsWS] Error checking access:", error);
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

function broadcastYjsToRoom(noteId: number, update: Uint8Array, excludeUserId?: number) {
  const room = noteRooms.get(noteId);
  if (!room) return;

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  encoding.writeVarUint(encoder, 2); // update message
  encoding.writeVarUint8Array(encoder, update);
  const message = encoding.toUint8Array(encoder);

  for (const client of room) {
    if (excludeUserId !== undefined && client.userId === excludeUserId) {
      continue;
    }
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
}

function broadcastAwarenessToRoom(noteId: number, awarenessUpdate: Uint8Array, excludeUserId?: number) {
  const room = noteRooms.get(noteId);
  if (!room) return;

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageAwareness);
  encoding.writeVarUint8Array(encoder, awarenessUpdate);
  const message = encoding.toUint8Array(encoder);

  for (const client of room) {
    if (excludeUserId !== undefined && client.userId === excludeUserId) {
      continue;
    }
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
}
