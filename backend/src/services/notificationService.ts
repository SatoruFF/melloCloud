import { prisma } from "../configs/config.js";
import createError from "http-errors";

class NotificationServiceClass {
  async getAll(userId: number) {
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return list;
  }

  async getUnreadCount(userId: number) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw createError(404, "Notification not found");
    }
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { message: "All notifications marked as read" };
  }

  async remove(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw createError(404, "Notification not found");
    }
    await prisma.notification.delete({
      where: { id },
    });
    return { message: "Notification removed" };
  }

  async clearAll(userId: number) {
    await prisma.notification.deleteMany({
      where: { userId },
    });
    return { message: "All notifications cleared" };
  }

  /** Create notification (for use from other services: messages, files, tasks, etc.) */
  async create(params: {
    userId: number;
    type: string;
    title?: string;
    text: string;
    link?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        text: params.text,
        link: params.link,
      },
    });
  }
}

export const NotificationService = new NotificationServiceClass();
