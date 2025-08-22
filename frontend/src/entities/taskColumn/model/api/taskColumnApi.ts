import { rtkApi } from "../../../../shared/api/rtkApi";
import { TaskColumn } from "../../types/tasksColumn";

export const taskColumnApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    // Column endpoints
    getColumns: builder.query<TaskColumn[], void>({
      query: () => "columns",
    }),

    createColumn: builder.mutation<
      TaskColumn,
      {
        title: string;
        color: string;
      }
    >({
      query: (body) => ({
        url: "columns",
        method: "POST",
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
        url: `columns/${columnId}`,
        method: "PUT",
        body,
      }),
    }),

    deleteColumn: builder.mutation<{ message: string }, string | number>({
      query: (columnId) => ({
        url: `columns/${columnId}`,
        method: "DELETE",
      }),
    }),

    reorderColumns: builder.mutation<
      TaskColumn[],
      Array<{
        id: number;
        order: number;
      }>
    >({
      query: (columnOrders) => ({
        url: "columns/reorder",
        method: "PATCH",
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
      query: () => "columns/stats",
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
