import type { Request, Response } from "express";
import createError from "http-errors";
import { logger } from "../configs/logger.js";
import { EventsService } from "../services/eventService.js";
import { serializeBigInt } from "../helpers/serializeBigInt.js";

class EventsControllerClass {
  async getUserEvents(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      if (!userId) {
        throw createError(401, "User not found");
      }

      const events = await EventsService.getUserEvents(req.context, userId);
      return res.json(serializeBigInt(events));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async getEventsByDateRange(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { startDate, endDate } = req.query;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!startDate || !endDate) {
        throw createError(400, "Start date and end date are required");
      }

      const events = await EventsService.getEventsByDateRange(
        req.context,
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      return res.json(serializeBigInt(events));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async searchEvents(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { query } = req.query;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!query || typeof query !== "string") {
        throw createError(400, "Search query is required");
      }

      const events = await EventsService.searchEvents(req.context, userId, query);
      return res.json(serializeBigInt(events));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { eventId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      const event = await EventsService.getEvent(req.context, eventId, userId);
      return res.json(serializeBigInt(event));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const {
        title,
        description,
        location,
        color,
        category,
        startDate,
        endDate,
        allDay,
        taskId,
        attendees,
      } = req.body;

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

      const event = await EventsService.createEvent(req.context, userId, {
        title,
        description,
        location,
        color,
        category,
        startDate: start,
        endDate: end,
        allDay,
        taskId,
        attendees,
      });

      return res.status(201).json(serializeBigInt(event));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { eventId } = req.params;
      const {
        title,
        description,
        location,
        color,
        category,
        startDate,
        endDate,
        allDay,
      } = req.body;

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

      const event = await EventsService.updateEvent(req.context, eventId, userId, {
        title,
        description,
        location,
        color,
        category,
        startDate,
        endDate,
        allDay,
      });

      return res.json(serializeBigInt(event));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { eventId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      const result = await EventsService.deleteEvent(req.context, eventId, userId);
      return res.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  // ===== ATTENDEES =====

  async addAttendee(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { eventId } = req.params;
      const { attendeeId } = req.body;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      if (!attendeeId) {
        throw createError(400, "Attendee ID is required");
      }

      const result = await EventsService.addAttendee(
        req.context,
        eventId,
        userId,
        attendeeId
      );

      return res.status(201).json(serializeBigInt(result));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async removeAttendee(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { eventId, attendeeUserId } = req.params;

      if (!userId) {
        throw createError(401, "User not found");
      }

      if (!eventId) {
        throw createError(400, "Event ID is required");
      }

      if (!attendeeUserId) {
        throw createError(400, "Attendee user ID is required");
      }

      const result = await EventsService.removeAttendee(
        req.context,
        eventId,
        userId,
        attendeeUserId
      );

      return res.json(result);
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }

  async updateAttendeeStatus(req: Request, res: Response) {
    try {
      const { userId } = req.context;
      const { eventId } = req.params;
      const { status } = req.body;

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

      const result = await EventsService.updateAttendeeStatus(
        req.context,
        eventId,
        userId,
        status
      );

      return res.json(serializeBigInt(result));
    } catch (error: any) {
      logger.error(error.message, error);
      return res.status(error.statusCode || 500).send({
        message: error.message,
      });
    }
  }
}

export const EventsController = new EventsControllerClass();
