import { ApiPaths } from '../../../../shared';
import { rtkApi } from '../../../../shared';
import { TaskColumn } from '../../types/taskColumns';

export const taskColumnApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    getColumns: builder.query<TaskColumn[], number | void>({
      query: boardId =>
        boardId != null ? `${ApiPaths.columns}?boardId=${boardId}` : ApiPaths.columns,
    }),

    createColumn: builder.mutation<
      TaskColumn,
      {
        title: string;
        color: string;
        boardId: number;
      }
    >({
      query: body => ({
        url: ApiPaths.columns,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Kanban'],
    }),

    updateColumn: builder.mutation<
      TaskColumn,
      {
        columnId: string | number;
        title?: string;
        color?: string;
        order?: number;
      }
    >({
      query: ({ columnId, ...body }) => ({
        url: `${ApiPaths.columns}/${columnId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Kanban'],
    }),

    deleteColumn: builder.mutation<{ message: string }, string | number>({
      query: columnId => ({
        url: `${ApiPaths.columns}/${columnId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Kanban'],
    }),

    reorderColumns: builder.mutation<
      TaskColumn[],
      Array<{
        id: number;
        order: number;
      }>
    >({
      query: columnOrders => ({
        url: `${ApiPaths.columns}/reorder`,
        method: 'PATCH',
        body: { columnOrders },
      }),
      invalidatesTags: ['Kanban'],
    }),

    getColumnStats: builder.query<
      Array<{
        id: number;
        title: string;
        color: string;
        order: number;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        priorityBreakdown: {
          high: number;
          medium: number;
          low: number;
        };
      }>,
      number
    >({
      query: boardId => `${ApiPaths.columns}/stats?boardId=${boardId}`,
    }),
  }),
});

export const {
  useGetColumnsQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnsMutation,
  useGetColumnStatsQuery,
} = taskColumnApi;
