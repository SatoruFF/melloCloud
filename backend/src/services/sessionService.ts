import { prisma } from "../configs/config.js";
import { v4 as uuidv4 } from "uuid";
import createError from "http-errors";

interface ICreateSession {
  userId: number;
  refreshToken: string;
  userAgent?: string;
  ip?: string;
}

class SessionServiceClass {
  // Создать новую сессию
  async createSession({ userId, refreshToken, userAgent, ip }: ICreateSession) {
    const sessionId = uuidv4();

    // Ограничение: максимум 5 активных сессий на пользователя
    const activeSessions = await prisma.session.count({
      where: { userId },
    });

    if (activeSessions >= 5) {
      // Удаляем самую старую сессию
      const oldestSession = await prisma.session.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      if (oldestSession) {
        await prisma.session.delete({
          where: { id: oldestSession.id },
        });
      }
    }

    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        refreshToken,
        userAgent: userAgent || "Unknown",
        ip: ip || "Unknown",
        lastActivity: new Date(),
      },
    });

    return session;
  }

  // Обновить сессию
  async updateSession(sessionId: string, refreshToken: string) {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken,
        lastActivity: new Date(),
      },
    });

    return session;
  }

  // Получить сессию по refresh token
  async getSessionByRefreshToken(refreshToken: string) {
    const session = await prisma.session.findFirst({
      where: { refreshToken },
      include: { user: true },
    });

    return session;
  }

  // Получить все сессии пользователя
  async getUserSessions(userId: number) {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { lastActivity: "desc" },
      select: {
        id: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        lastActivity: true,
      },
    });

    return sessions;
  }

  // Удалить сессию (logout)
  async deleteSession(sessionId: string) {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  }

  // Удалить конкретную сессию пользователя
  async deleteUserSession(userId: number, sessionId: string) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw createError(404, "Session not found");
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return session;
  }

  // Удалить все сессии пользователя кроме текущей
  async deleteAllUserSessionsExceptCurrent(userId: number, currentSessionId: string) {
    await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });
  }

  // Удалить все сессии пользователя
  async deleteAllUserSessions(userId: number) {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  // Очистить устаревшие сессии (старше 30 дней)
  async cleanExpiredSessions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.session.deleteMany({
      where: {
        lastActivity: {
          lt: thirtyDaysAgo,
        },
      },
    });
  }
}

export const SessionService = new SessionServiceClass();
