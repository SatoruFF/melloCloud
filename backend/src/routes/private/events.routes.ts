import { Hono } from "hono";
import { EventsController } from "../../controllers/eventController.js";

const router = new Hono();

// Get all user events
router.get("/", (c) => EventsController.getUserEvents(c));

// TODO: merge with common get + filters
// Get events by date range
router.get("/range", (c) => EventsController.getEventsByDateRange(c));

// Search events
router.get("/search", (c) => EventsController.searchEvents(c));

// Get single event
router.get("/:eventId", (c) => EventsController.getEvent(c));

// Create event
router.post("/", (c) => EventsController.createEvent(c));

// Update event
router.put("/:eventId", (c) => EventsController.updateEvent(c));

// Delete event
router.delete("/:eventId", (c) => EventsController.deleteEvent(c));

// ===== ATTENDEES =====
router.post("/:eventId/attendees", (c) => EventsController.addAttendee(c));
router.delete("/:eventId/attendees/:attendeeUserId", (c) => EventsController.removeAttendee(c));
router.put("/:eventId/attendees/status", (c) => EventsController.updateAttendeeStatus(c));

export default router;
