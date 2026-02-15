import type { Context } from "hono";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { EventsService } from "../services/eventService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";
import ApiContext from "../models/context.js";

class EventsControllerClass {
  async getUserEvents(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      if (!userId) {
        throw createError(401, "User not found");
      }

      const events = await EventsService.getUserEvents(apiContext, userId);
      return c.json(serializeBigInt(events));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async getEventsByDateRange(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { startDate, endDate } = c.req.query();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!startDate || !endDate) {
        throw createError(400, "Start date and end date are required");
      }

      const events = await EventsService.getEventsByDateRange(
        apiContext,
        userId,
        new Date(startDate as string),
        new Date(endDate as string),
      );

      return c.json(serializeBigInt(events));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async searchEvents(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { query } = c.req.query();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!query || typeof query !== "string") {
        throw createError(400, "Search query is required");
      }

      const events = await EventsService.searchEvents(apiContext, userId, query);
      return c.json(serializeBigInt(events));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async getEvent(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { eventId } = c.req.param();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      const event = await EventsService.getEvent(apiContext, eventId, userId);
      return c.json(serializeBigInt(event));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async createEvent(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { title, description, location, color, category, startDate, endDate, allDay, taskId, attendees } =
        await c.req.json<{
          title: string;
          description?: string;
          location?: string;
          color?: string;
          category?: string;
          startDate: string;
          endDate: string;
          allDay?: boolean;
          taskId?: number;
          attendees?: unknown;
        }>();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!title) {
        throw createError(400, "Title is required");
      }

      if (!startDate || !endDate) {
        throw createError(400, "Start date and end date are required");
      }

      // Валидация дат
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw createError(400, "Invalid date format");
      }

      if (start > end) {
        throw createError(400, "Start date must be before end date");
      }

      // Валидация attendees
      if (attendees !== undefined && !Array.isArray(attendees)) {
        throw createError(400, "Attendees must be an array");
      }

      const attendeeIds =
        attendees !== undefined && Array.isArray(attendees)
          ? (attendees as number[])
          : undefined;

      const event = await EventsService.createEvent(apiContext, userId, {
        title,
        description,
        location,
        color,
        category,
        startDate: start,
        endDate: end,
        allDay,
        taskId,
        attendees: attendeeIds,
      });

      return c.json(serializeBigInt(event), 201);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async updateEvent(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { eventId } = c.req.param();
      const { title, description, location, color, category, startDate, endDate, allDay } = await c.req.json<{
        title?: string;
        description?: string;
        location?: string;
        color?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
        allDay?: boolean;
      }>();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      // Валидация дат если они переданы
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw createError(400, "Invalid date format");
        }

        if (start > end) {
          throw createError(400, "Start date must be before end date");
        }
      }

      const event = await EventsService.updateEvent(apiContext, eventId, userId, {
        title,
        description,
        location,
        color,
        category,
        startDate,
        endDate,
        allDay,
      });

      return c.json(serializeBigInt(event));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async deleteEvent(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { eventId } = c.req.param();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      const result = await EventsService.deleteEvent(apiContext, eventId, userId);
      return c.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  // ===== ATTENDEES =====

  async addAttendee(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { eventId } = c.req.param();
      const { attendeeId } = await c.req.json<{ attendeeId: number }>();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      if (!attendeeId) {
        throw createError(400, "Attendee ID is required");
      }

      const result = await EventsService.addAttendee(apiContext, eventId, userId, attendeeId);

      return c.json(serializeBigInt(result), 201);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async removeAttendee(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { eventId, attendeeUserId } = c.req.param();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      if (!attendeeUserId) {
        throw createError(400, "Attendee user ID is required");
      }

      const result = await EventsService.removeAttendee(apiContext, eventId, userId, attendeeUserId);

      return c.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }

  async updateAttendeeStatus(c: Context) {
    try {
      const apiContext = (c.get("context") as ApiContext | undefined) ?? null;
      const userId = (c.get("user") as { id?: number } | undefined)?.id ?? c.get("userId");
      const { eventId } = c.req.param();
      const { status } = await c.req.json<{ status: string }>();

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      if (!status) {
        throw createError(400, "Status is required");
      }

      // Валидация статуса
      const validStatuses = ["pending", "accepted", "declined"];
      if (!validStatuses.includes(status)) {
        throw createError(400, `Status must be one of: ${validStatuses.join(", ")}`);
      }

      const result = await EventsService.updateAttendeeStatus(apiContext, eventId, userId, status);

      return c.json(serializeBigInt(result));
    } catch (error: any) {
      logger.error(error.message, error);
      return c.json({ message: error.message }, error.statusCode || 500);
    }
  }
}

export const EventsController = new EventsControllerClass();
