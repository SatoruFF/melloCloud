import { ApiPaths, rtkApi } from '../../../../shared';
import type { KanbanBoard, KanbanBoardWithOwner } from '../../types/board';

export const boardApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    getBoards: builder.query<(KanbanBoard & { isOwner?: boolean })[], void>({
      query: () => ApiPaths.boards,
      providesTags: ['Board'],
    }),

    getBoard: builder.query<KanbanBoardWithOwner, number>({
      query: id => `${ApiPaths.boards}/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Board', id }],
    }),

    createBoard: builder.mutation<KanbanBoard, { title: string }>({
      query: body => ({
        url: ApiPaths.boards,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Board'],
    }),

    updateBoard: builder.mutation<KanbanBoard, { boardId: number; title: string }>({
      query: ({ boardId, ...body }) => ({
        url: `${ApiPaths.boards}/${boardId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { boardId }) => [{ type: 'Board', id: boardId }, 'Board'],
    }),

    deleteBoard: builder.mutation<{ message: string }, number>({
      query: id => ({
        url: `${ApiPaths.boards}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Board', 'Kanban'],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} = boardApi;
