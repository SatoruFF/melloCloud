import { Hono } from "hono";
import { NotesController } from "../../controllers/noteController.js";

const router = new Hono();

// Get all user notes
router.get("/", (c) => NotesController.getUserNotes(c));

// Search notes
router.get("/search", (c) => NotesController.searchNotes(c));

// Get single note
router.get("/:noteId", (c) => NotesController.getNote(c));

// Create note
router.post("/", (c) => NotesController.createNote(c));

// Update note
router.put("/:noteId", (c) => NotesController.updateNote(c));

// Delete note
router.delete("/:noteId", (c) => NotesController.deleteNote(c));

export default router;
