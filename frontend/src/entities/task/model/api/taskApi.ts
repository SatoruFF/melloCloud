import { ApiPaths, rtkApi } from '../../../../shared';
import { Task, TaskColumn } from '../../types/tasks';

export const taskApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // Task endpoints
    getTasks: builder.query<Task[], void>({
      query: () => ApiPaths.tasks,
    }),

    getKanbanData: builder.query<TaskColumn[], number>({
      query: boardId => `${ApiPaths.tasks}/kanban?boardId=${boardId}`,
      providesTags: ['Kanban'],
    }),

    createTask: builder.mutation<
      Task,
      {
        title: string;
        content: string;
        priority?: string;
        columnId?: number;
        dueDate?: string;
      }
    >({
      query: body => ({
        url: ApiPaths.tasks,
        method: 'POST',
        body,
      }),
    }),

    updateTask: builder.mutation<
      Task,
      {
        taskId: string | number;
        title?: string;
        content?: string;
        description?: string | null;
        priority?: string;
        isDone?: boolean;
        columnId?: number;
        dueDate?: string;
      }
    >({
      query: ({ taskId, ...body }) => ({
        url: `${ApiPaths.tasks}/${taskId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Kanban'],
    }),

    deleteTask: builder.mutation<{ message: string }, string | number>({
      query: taskId => ({
        url: `${ApiPaths.tasks}/${taskId}`,
        method: 'DELETE',
      }),
    }),

    moveTask: builder.mutation<
      Task,
      {
        taskId: string | number;
        columnId: number;
      }
    >({
      query: ({ taskId, columnId }) => ({
        url: `${ApiPaths.tasks}/${taskId}/move`,
        method: 'PATCH',
        body: { columnId },
      }),
    }),

    toggleTaskComplete: builder.mutation<Task, string | number>({
      query: taskId => ({
        url: `${ApiPaths.tasks}/${taskId}/toggle`,
        method: 'PATCH',
      }),
    }),

    getTasksByColumn: builder.query<Task[], number>({
      query: columnId => `${ApiPaths.tasks}/column/${columnId}`,
    }),

    getTasksByPriority: builder.query<Task[], string>({
      query: priority => `${ApiPaths.tasks}/priority/${priority}`,
    }),

    getTasksByStatus: builder.query<Task[], 'completed' | 'pending'>({
      query: status => `${ApiPaths.tasks}/status/${status}`,
    }),

    searchTasks: builder.query<Task[], string>({
      query: query => `${ApiPaths.tasks}/search?query=${encodeURIComponent(query)}`,
    }),

    getTaskStats: builder.query<
      {
        total: number;
        completed: number;
        pending: number;
        overdue: number;
        byPriority: Record<string, number>;
        byColumn: Record<number, number>;
      },
      void
    >({
      query: () => `${ApiPaths.tasks}/stats`,
    }),

    getOverdueTasks: builder.query<Task[], void>({
      query: () => `${ApiPaths.tasks}/overdue`,
    }),

    getUpcomingTasks: builder.query<Task[], number>({
      query: (days = 7) => `${ApiPaths.tasks}/upcoming?days=${days}`,
    }),

    batchUpdateTasks: builder.mutation<
      Task[],
      Array<{
        id: number;
        columnId?: number;
        order?: number;
      }>
    >({
      query: updates => ({
        url: `${ApiPaths.tasks}/batch-update`,
        method: 'PATCH',
        body: { updates },
      }),
    }),
  }),
});

export const {
  // Task hooks
  useGetTasksQuery,
  useLazyGetTasksQuery,
  useGetKanbanDataQuery,
  useLazyGetKanbanDataQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useToggleTaskCompleteMutation,
  useGetTasksByColumnQuery,
  useGetTasksByPriorityQuery,
  useGetTasksByStatusQuery,
  useSearchTasksQuery,
  useGetTaskStatsQuery,
  useGetOverdueTasksQuery,
  useGetUpcomingTasksQuery,
  useBatchUpdateTasksMutation,
} = taskApi;
