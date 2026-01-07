import createError from "http-errors";
import { WebhookService } from "./webhookService";

class EventsServiceClass {
  //
  // GET ALL USER EVENTS
  //
  async getUserEvents(context: any, userId: number) {
    const events = await context.prisma.calendarEvent.findMany({
      where: {
        OR: [
          // События где пользователь владелец
          { userId },
          // События где пользователь участник
          {
            attendees: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        user: {
          select: {
            id: true,
            userName: true,
            avatar: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return events;
  }

  //
  // GET EVENTS BY DATE RANGE
  //
  async getEventsByDateRange(
    context: any,
    userId: number,
    startDate: Date,
    endDate: Date
  ) {
    const events = await context.prisma.calendarEvent.findMany({
      where: {
        OR: [
          { userId },
          {
            attendees: {
              some: {
                userId,
              },
            },
          },
        ],
        AND: [
          {
            startDate: {
              gte: startDate,
            },
          },
          {
            endDate: {
              lte: endDate,
            },
          },
        ],
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        user: {
          select: {
            id: true,
            userName: true,
            avatar: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return events;
  }

  //
  // SEARCH EVENTS
  //
  async searchEvents(context: any, userId: number, query: string) {
    const events = await context.prisma.calendarEvent.findMany({
      where: {
        OR: [
          { userId },
          {
            attendees: {
              some: {
                userId,
              },
            },
          },
        ],
        AND: [
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                location: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        user: {
          select: {
            id: true,
            userName: true,
            avatar: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return events;
  }

  //
  // GET SINGLE EVENT
  //
  async getEvent(context: any, eventId: string, userId: number) {
    const event = await context.prisma.calendarEvent.findFirst({
      where: {
        id: +eventId,
        OR: [
          { userId },
          {
            attendees: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            content: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!event) {
      throw createError(404, "Event not found");
    }

    return event;
  }

  //
  // CREATE EVENT
  //
  async createEvent(
    context: any,
    userId: number,
    data: {
      title: string;
      description?: string;
      location?: string;
      color?: string;
      category?: string;
      startDate: Date;
      endDate: Date;
      allDay?: boolean;
      taskId?: number;
      attendees?: number[];
    }
  ) {
    // Проверяем taskId если передан
    if (data.taskId) {
      const task = await context.prisma.task.findFirst({
        where: {
          id: data.taskId,
          userId,
        },
      });

      if (!task) {
        throw createError(404, "Task not found");
      }
    }

    // Создаём событие
    const event = await context.prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        color: data.color || "#1890ff",
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay || false,
        taskId: data.taskId,
        userId,
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        user: {
          select: {
            id: true,
            userName: true,
            avatar: true,
          },
        },
      },
    });

    // Добавляем участников если переданы
    if (data.attendees && data.attendees.length > 0) {
      await Promise.all(
        data.attendees.map((attendeeId) =>
          context.prisma.eventAttendee.create({
            data: {
              eventId: event.id,
              userId: attendeeId,
              status: "pending",
            },
          })
        )
      );

      // Перезапрашиваем событие с участниками
      const updatedEvent = await this.getEvent(context, event.id.toString(), userId);

      // Триггерим webhook EVENT_CREATED
      await WebhookService.triggerWebhooks(context, {
        event: "EVENT_CREATED",
        resourceType: "EVENT",
        resourceId: updatedEvent.id,
        data: updatedEvent,
        userId,
      });

      // Создаём напоминания
      await WebhookService.createEventReminders(context, {
        userId,
        eventId: updatedEvent.id,
        eventData: updatedEvent,
      });

      return updatedEvent;
    }

    // Триггерим webhook EVENT_CREATED
    await WebhookService.triggerWebhooks(context, {
      event: "EVENT_CREATED",
      resourceType: "EVENT",
      resourceId: event.id,
      data: event,
      userId,
    });

    // Создаём напоминания
    await WebhookService.createEventReminders(context, {
      userId,
      eventId: event.id,
      eventData: event,
    });

    return event;
  }

  //
  // UPDATE EVENT
  //
  async updateEvent(
    context: any,
    eventId: string,
    userId: number,
    data: {
      title?: string;
      description?: string;
      location?: string;
      color?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      allDay?: boolean;
    }
  ) {
    // Проверяем существование и доступ
    const existingEvent = await context.prisma.calendarEvent.findFirst({
      where: {
        id: +eventId,
        userId, // Только владелец может редактировать
      },
    });

    if (!existingEvent) {
      throw createError(404, "Event not found or access denied");
    }

    // Формируем данные для обновления
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.allDay !== undefined) updateData.allDay = data.allDay;

    const timeChanged = data.startDate !== undefined || data.endDate !== undefined;

    if (data.startDate !== undefined) {
      updateData.startDate = new Date(data.startDate);
    }

    if (data.endDate !== undefined) {
      updateData.endDate = new Date(data.endDate);
    }

    // Обновляем
    const event = await context.prisma.calendarEvent.update({
      where: { id: +eventId },
      data: updateData,
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        user: {
          select: {
            id: true,
            userName: true,
            avatar: true,
          },
        },
      },
    });

    // Триггерим webhook EVENT_UPDATED
    await WebhookService.triggerWebhooks(context, {
      event: "EVENT_UPDATED",
      resourceType: "EVENT",
      resourceId: event.id,
      data: event,
      userId,
    });

    // Если изменилось время - пересоздаём напоминания
    if (timeChanged) {
      // Удаляем старые запланированные напоминания
      await context.prisma.scheduledWebhook.deleteMany({
        where: {
          resourceType: "EVENT",
          resourceId: event.id,
          executed: false,
        },
      });

      // Создаём новые напоминания
      await WebhookService.createEventReminders(context, {
        userId,
        eventId: event.id,
        eventData: event,
      });
    }

    return event;
  }

  //
  // DELETE EVENT
  //
  async deleteEvent(context: any, eventId: string, userId: number) {
    // Проверяем существование и доступ
    const existingEvent = await context.prisma.calendarEvent.findFirst({
      where: {
        id: +eventId,
        userId,
      },
    });

    if (!existingEvent) {
      throw createError(404, "Event not found or access denied");
    }

    // Удаляем все запланированные webhooks для этого события
    await context.prisma.scheduledWebhook.deleteMany({
      where: {
        resourceType: "EVENT",
        resourceId: +eventId,
      },
    });

    // Удаляем событие (attendees удалятся каскадно)
    await context.prisma.calendarEvent.delete({
      where: { id: +eventId },
    });

    // Триггерим webhook EVENT_DELETED
    await WebhookService.triggerWebhooks(context, {
      event: "EVENT_DELETED",
      resourceType: "EVENT",
      resourceId: +eventId,
      data: { id: +eventId, title: existingEvent.title },
      userId,
    });

    return { message: "Event deleted successfully" };
  }

  //
  // ADD ATTENDEE
  //
  async addAttendee(
    context: any,
    eventId: string,
    userId: number,
    attendeeId: number
  ) {
    // Проверяем что событие существует и пользователь владелец
    const event = await context.prisma.calendarEvent.findFirst({
      where: {
        id: +eventId,
        userId,
      },
    });

    if (!event) {
      throw createError(404, "Event not found or access denied");
    }

    // Проверяем что attendee существует
    const attendeeUser = await context.prisma.user.findUnique({
      where: { id: attendeeId },
    });

    if (!attendeeUser) {
      throw createError(404, "User not found");
    }

    // Проверяем что участник ещё не добавлен
    const existingAttendee = await context.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: +eventId,
          userId: attendeeId,
        },
      },
    });

    if (existingAttendee) {
      throw createError(400, "User is already an attendee");
    }

    // Добавляем участника
    const attendee = await context.prisma.eventAttendee.create({
      data: {
        eventId: +eventId,
        userId: attendeeId,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return attendee;
  }

  //
  // REMOVE ATTENDEE
  //
  async removeAttendee(
    context: any,
    eventId: string,
    userId: number,
    attendeeUserId: string
  ) {
    // Проверяем что событие существует и пользователь владелец
    const event = await context.prisma.calendarEvent.findFirst({
      where: {
        id: +eventId,
        userId,
      },
    });

    if (!event) {
      throw createError(404, "Event not found or access denied");
    }

    // Удаляем участника
    const deleted = await context.prisma.eventAttendee.deleteMany({
      where: {
        eventId: +eventId,
        userId: +attendeeUserId,
      },
    });

    if (deleted.count === 0) {
      throw createError(404, "Attendee not found");
    }

    return { message: "Attendee removed successfully" };
  }

  //
  // UPDATE ATTENDEE STATUS (сам участник обновляет свой статус)
  //
  async updateAttendeeStatus(
    context: any,
    eventId: string,
    userId: number,
    status: string
  ) {
    // Проверяем что пользователь является участником
    const attendee = await context.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: +eventId,
          userId,
        },
      },
    });

    if (!attendee) {
      throw createError(404, "You are not an attendee of this event");
    }

    // Обновляем статус
    const updated = await context.prisma.eventAttendee.update({
      where: {
        eventId_userId: {
          eventId: +eventId,
          userId,
        },
      },
      data: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            avatar: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return updated;
  }
}

export const EventsService = new EventsServiceClass();
