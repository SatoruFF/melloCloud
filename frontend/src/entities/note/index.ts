import { noteReducer } from './model/slice/noteSlice';
import type { NotesState } from './types/note';

export { noteReducer, NotesState };

export { NoteCard } from './ui/NoteCard';

// API Hooks
export {
  useGetNotesQuery,
  useLazyGetNotesQuery,
  useGetNoteQuery,
  useLazyGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useSearchNotesQuery,
} from './model/api/noteApi';

// API Types
export type {
  NotesView,
  NotesViewFilter,
  GetNotesParams,
  BlockNoteContent,
  CreateNotePayload,
  UpdateNotePayload,
} from './model/api/noteApi';
