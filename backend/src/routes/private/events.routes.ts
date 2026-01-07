import { Router } from "express";
import { EventsController } from "../../controllers/eventController.js";

const router = Router();

// Get all user events
router.get("/", EventsController.getUserEvents);

// TODO: merge with common get + filters
// Get events by date range
router.get("/range", EventsController.getEventsByDateRange);

// Search events
router.get("/search", EventsController.searchEvents);

// Get single event
router.get("/:eventId", EventsController.getEvent);

// Create event
router.post("/", EventsController.createEvent);

// Update event
router.put("/:eventId", EventsController.updateEvent);

// Delete event
router.delete("/:eventId", EventsController.deleteEvent);

// ===== ATTENDEES =====
router.post("/:eventId/attendees", EventsController.addAttendee);
router.delete("/:eventId/attendees/:attendeeUserId", EventsController.removeAttendee);
router.put("/:eventId/attendees/status", EventsController.updateAttendeeStatus);

export default router;
