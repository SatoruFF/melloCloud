import { rtkApi } from "../../../../shared/api/rtkApi";

export const taskApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    sendTask: builder.mutation<any, any>({
      query: (body) => ({
        url: "tasks",
        method: "POST",
        body,
      }),
    }),
    deleteTask: builder.mutation<{ taskId: string }, any>({
      query: ({ taskId }) => ({
        url: `tasks/delete?id=${taskId}`,
        method: "DELETE",
        body: { taskId },
      }),
    }),
    getTasks: builder.query<any, any>({
      query: (chatId: string) => `tasks`,
    }),
    editTask: builder.mutation<any, any>({
      query: ({ taskId, newText }) => ({
        url: `tasks/edit`,
        method: "PUT",
        body: { taskId, newText },
      }),
    }),
  }),
});

export const {
  useGetTasksQuery,
  useLazyGetTasksQuery,
  useSendTaskMutation,
  useDeleteTaskMutation,
  useEditTaskMutation,
} = taskApi;
