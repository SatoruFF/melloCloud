import { rtkApi } from "../../../../shared/api/rtkApi";

export interface Note {
  id: string;
  title: string;
  content: any; // BlockNote content
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export const notesApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notes
    getNotes: builder.query<Note[], void>({
      query: () => "notes",
    }),

    // Get single note by ID
    getNote: builder.query<Note, string>({
      query: (noteId) => `notes/${noteId}`,
    }),

    // Create new note
    createNote: builder.mutation<
      Note,
      {
        title: string;
        content: any;
      }
    >({
      query: (body) => ({
        url: "notes",
        method: "POST",
        body,
      }),
    }),

    // Update note
    updateNote: builder.mutation<
      Note,
      {
        noteId: string;
        title?: string;
        content?: any;
      }
    >({
      query: ({ noteId, ...body }) => ({
        url: `notes/${noteId}`,
        method: "PUT",
        body,
      }),
    }),

    // Delete note
    deleteNote: builder.mutation<{ message: string }, string>({
      query: (noteId) => ({
        url: `notes/${noteId}`,
        method: "DELETE",
      }),
    }),

    // Search notes
    searchNotes: builder.query<Note[], string>({
      query: (query) => `notes/search?query=${encodeURIComponent(query)}`,
    }),
  }),
});

export const {
  useGetNotesQuery,
  useLazyGetNotesQuery,
  useGetNoteQuery,
  useLazyGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useSearchNotesQuery,
} = notesApi;
