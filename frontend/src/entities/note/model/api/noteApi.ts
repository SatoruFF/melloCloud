import { ApiPaths, rtkApi } from '../../../../shared';
import type { Note } from '../../types/note';

export type NotesView = 'all' | 'starred' | 'trash';
export type NotesViewFilter = 'all' | 'starred' | 'tags' | 'trash';

export interface GetNotesParams {
  view?: NotesView;
  tag?: string;
}

export const notesApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // Get notes with optional filter: view (all | starred | trash), tag
    getNotes: builder.query<Note[], GetNotesParams | void>({
      query: (params) => {
        const view = (params as GetNotesParams)?.view ?? 'all';
        const tag = (params as GetNotesParams)?.tag;
        const search = new URLSearchParams();
        if (view) search.set('view', view);
        if (tag) search.set('tag', tag);
        const q = search.toString();
        return q ? `${ApiPaths.notes}?${q}` : ApiPaths.notes;
      },
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.map(note => ({ type: 'Notes' as const, id: note.id })),
              { type: 'Notes' as const, id: 'LIST' },
              ...(typeof arg === 'object' && arg ? [{ type: 'Notes' as const, id: `LIST-${arg.view}-${arg.tag ?? ''}` }] : []),
            ]
          : [{ type: 'Notes' as const, id: 'LIST' }],
    }),

    // Get single note by ID
    getNote: builder.query<Note, string>({
      query: noteId => `${ApiPaths.notes}/${noteId}`,
      providesTags: (_result, _error, id) => [{ type: 'Notes' as const, id }],
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
        url: ApiPaths.notes,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Notes', id: 'LIST' }],
    }),

    // Update note (title, content, isStarred, isRemoved, tags)
    updateNote: builder.mutation<
      Note,
      {
        noteId: string;
        title?: string;
        content?: any;
        isStarred?: boolean;
        isRemoved?: boolean;
        tags?: string[];
      }
    >({
      query: ({ noteId, ...body }) => ({
        url: `${ApiPaths.notes}/${noteId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { noteId }) => [
        { type: 'Notes', id: noteId },
        { type: 'Notes', id: 'LIST' },
      ],
    }),

    // Delete note
    deleteNote: builder.mutation<{ message: string }, string>({
      query: noteId => ({
        url: `${ApiPaths.notes}/${noteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, noteId) => [
        { type: 'Notes', id: noteId },
        { type: 'Notes', id: 'LIST' },
      ],
    }),

    // Search notes
    searchNotes: builder.query<Note[], string>({
      query: query => `${ApiPaths.notes}/search?query=${encodeURIComponent(query)}`,
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
