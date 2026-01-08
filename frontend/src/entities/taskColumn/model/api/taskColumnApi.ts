import { ApiPaths } from '../../../../shared';
import { rtkApi } from '../../../../shared';
import { TaskColumn } from '../../types/taskColumns';

export const taskColumnApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // Column endpoints
    getColumns: builder.query<TaskColumn[], void>({
      query: () => ApiPaths.columns,
    }),

    createColumn: builder.mutation<
      TaskColumn,
      {
        title: string;
        color: string;
      }
    >({
      query: body => ({
        url: ApiPaths.columns,
        method: 'POST',
        body,
      }),
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
    }),

    deleteColumn: builder.mutation<{ message: string }, string | number>({
      query: columnId => ({
        url: `${ApiPaths.columns}/${columnId}`,
        method: 'DELETE',
      }),
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
      void
    >({
      query: () => `${ApiPaths.columns}/stats`,
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
