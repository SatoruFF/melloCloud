import { rtkApi } from '../../../../shared/api/rtkApi';
import type { Note } from '../../types/note';

export const notesApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // Get all notes
    getNotes: builder.query<Note[], void>({
      query: () => 'notes',
      providesTags: result =>
        result
          ? [...result.map(note => ({ type: 'Notes' as const, id: note.id })), { type: 'Notes' as const, id: 'LIST' }]
          : [{ type: 'Notes' as const, id: 'LIST' }],
    }),

    // Get single note by ID
    getNote: builder.query<Note, string>({
      query: noteId => `notes/${noteId}`,
      providesTags: (result, error, id) => [{ type: 'Notes' as const, id }],
    }),

    // Create new note
    createNote: builder.mutation<
      Note,
      {
        title: string;
        content: any;
      }
    >({
      query: body => ({
        url: 'notes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Notes', id: 'LIST' }],
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
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { noteId }) => [
        { type: 'Notes', id: noteId },
        { type: 'Notes', id: 'LIST' },
      ],
    }),

    // Delete note
    deleteNote: builder.mutation<{ message: string }, string>({
      query: noteId => ({
        url: `notes/${noteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, noteId) => [
        { type: 'Notes', id: noteId },
        { type: 'Notes', id: 'LIST' },
      ],
    }),

    // Search notes
    searchNotes: builder.query<Note[], string>({
      query: query => `notes/search?query=${encodeURIComponent(query)}`,
      providesTags: result => (result ? result.map(note => ({ type: 'Notes' as const, id: note.id })) : []),
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
