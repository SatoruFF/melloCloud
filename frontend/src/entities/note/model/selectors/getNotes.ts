import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../app/store';

// Base selector
const getNotesState = (state: RootState) => state.notes;

// Simple selectors
export const selectNotes = createSelector([getNotesState], notesState => notesState.notes);

export const selectNotesLoading = createSelector([getNotesState], notesState => notesState.loading);

export const selectNotesError = createSelector([getNotesState], notesState => notesState.error);

export const selectSelectedNoteId = createSelector([getNotesState], notesState => notesState.selectedNoteId);

// Derived selectors
export const selectNoteById = (id: string | number | null | undefined) =>
  createSelector([selectNotes], notes => {
    if (id == null) return undefined;
    return notes.find(note => note.id.toString() === id.toString());
  });

export const selectNotesSortedByUpdatedAt = createSelector([selectNotes], notes =>
  [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
);

export const selectNotesBySearch = (query: string) =>
  createSelector([selectNotes], notes => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(note => note.title.toLowerCase().includes(q));
  });

export const selectSelectedNote = createSelector([selectNotes, selectSelectedNoteId], (notes, selectedId) => {
  if (selectedId == null) return undefined;
  return notes.find(note => note.id.toString() === selectedId.toString());
});
