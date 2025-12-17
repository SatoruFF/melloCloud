import { Router } from "express";
import { NotesController } from "../../controllers/noteController.js";

const router = Router();

// Get all user notes
router.get("/", NotesController.getUserNotes);

// Search notes
router.get("/search", NotesController.searchNotes);

// Get single note
router.get("/:noteId", NotesController.getNote);

// Create note
router.post("/", NotesController.createNote);

// Update note
router.put("/:noteId", NotesController.updateNote);

// Delete note
router.delete("/:noteId", NotesController.deleteNote);

export default router;
