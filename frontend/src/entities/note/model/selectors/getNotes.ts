import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../app/store/store';

// базовые
export const selectNotesState = (state: RootState) => state.note;

export const selectNotes = (state: RootState) => state.note.notes;
export const selectNotesLoading = (state: RootState) => state.note.loading;
export const selectNotesError = (state: RootState) => state.note.error;
export const selectSelectedNoteId = (state: RootState) => state.note.selectedNoteId;

// вычисляемые
export const selectNoteById = createSelector(
  [selectNotes, (_: RootState, id: string | number | null | undefined) => id],
  (notes, id) => {
    if (id == null) return undefined;
    return notes.find(note => note.id.toString() === id.toString());
  },
);

export const selectNotesSortedByUpdatedAt = createSelector([selectNotes], notes =>
  [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
);

export const selectNotesBySearch = createSelector(
  [selectNotes, (_: RootState, query: string) => query],
  (notes, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(note => note.title.toLowerCase().includes(q));
  },
);
