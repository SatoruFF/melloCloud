import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Note, NotesState } from '../../types/note';

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  selectedNoteId: null,
};

export const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.push(action.payload);
    },
    updateNote: (state, action: PayloadAction<{ id: string | number; updates: Partial<Note> }>) => {
      const { id, updates } = action.payload;
      const index = state.notes.findIndex(note => note.id.toString() === id.toString());
      if (index !== -1) {
        state.notes[index] = { ...state.notes[index], ...updates };
      }
    },
    deleteNote: (state, action: PayloadAction<string | number>) => {
      state.notes = state.notes.filter(note => note.id.toString() !== action.payload.toString());
      if (state.selectedNoteId?.toString() === action.payload.toString()) {
        state.selectedNoteId = null;
      }
    },
    setSelectedNote: (state, action: PayloadAction<string | number | null>) => {
      state.selectedNoteId = action.payload;
    },
    setNotesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setNotesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearNotesState: () => initialState,
  },
});

export const {
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setSelectedNote,
  setNotesLoading,
  setNotesError,
  clearNotesState,
} = noteSlice.actions;

export const { reducer: noteReducer } = noteSlice;

export default noteSlice.reducer;
