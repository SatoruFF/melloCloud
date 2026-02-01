import { rtkApi } from '../../../shared/api/rtkApi';
import { ApiPaths } from '../../../shared/consts/localVariables';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface AdminUsersResponse {
  data: Array<{
    id: number;
    userName: string | null;
    email: string;
    role: string;
    isActivated: boolean;
    isBlocked: boolean;
    diskSpace: string;
    usedSpace: string;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface AdminFilesResponse {
  data: Array<{
    id: number;
    type: string | null;
    size: number | null;
    userId: number;
    user: { id: number; email: string };
    createdAt: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface AdminNotesResponse {
  data: Array<{
    id: number;
    userId: number;
    user: { id: number; email: string };
    isStarred: boolean;
    isRemoved: boolean;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface AdminInvitesResponse {
  data: Array<{
    id: number;
    userName: string | null;
    email: string;
    isUsed: boolean;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface AdminSessionsResponse {
  data: Array<{
    id: string;
    userId: number;
    userAgent: string;
    ip: string;
    lastActivity: string;
    user: { id: number; userName: string | null; email: string };
  }>;
  total: number;
  page: number;
  limit: number;
}

interface AdminTasksResponse {
  data: Array<{
    id: number;
    status: string;
    priority: string;
    userId: number;
    user: { id: number; email: string };
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface AdminEventsResponse {
  data: Array<{
    id: number;
    startDate: string;
    endDate: string;
    userId: number;
    user: { id: number; email: string };
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface AdminBoardsResponse {
  data: Array<{
    id: number;
    userId: number;
    user: { id: number; email: string };
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface AdminStatsResponse {
  totalStorageUsed: string;
  totalStorageLimit: string;
  usagePercent: number;
  usersCount: number;
  filesCount: number;
  notesCount: number;
  activeUsersByDay: Array<{ date: string; count: number }>;
}

export interface AdminFeatureFlagItem {
  id: number;
  key: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  _count: { enabledForUsers: number };
}

export const adminApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminUsers: build.query<AdminUsersResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminUsers,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: ['AdminUsers'],
    }),
    getAdminUser: build.query<Record<string, unknown>, number>({
      query: (id) => ({ url: `${ApiPaths.adminUsers}/${id}` }),
    }),
    updateAdminUser: build.mutation<
      Record<string, unknown>,
      { id: number; userName?: string; role?: string; isActivated?: boolean; isBlocked?: boolean; diskSpace?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `${ApiPaths.adminUsers}/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    getAdminFiles: build.query<AdminFilesResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminFiles,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: ['AdminFiles'],
    }),
    deleteAdminFile: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `${ApiPaths.adminFiles}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminFiles'],
    }),
    getAdminNotes: build.query<AdminNotesResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminNotes,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: ['AdminNotes'],
    }),
    deleteAdminNote: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `${ApiPaths.adminNotes}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminNotes'],
    }),
    getAdminInvites: build.query<AdminInvitesResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminInvites,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
    }),
    getAdminSessions: build.query<AdminSessionsResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminSessions,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
    }),
    getAdminStats: build.query<AdminStatsResponse, void>({
      query: () => ApiPaths.adminStats,
    }),
    getAdminTasks: build.query<AdminTasksResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminTasks,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: ['AdminTasks'],
    }),
    deleteAdminTask: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `${ApiPaths.adminTasks}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminTasks'],
    }),
    getAdminEvents: build.query<AdminEventsResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminEvents,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: ['AdminEvents'],
    }),
    deleteAdminEvent: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `${ApiPaths.adminEvents}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminEvents'],
    }),
    getAdminBoards: build.query<AdminBoardsResponse, PaginationParams | void>({
      query: (params = {}) => ({
        url: ApiPaths.adminBoards,
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: ['AdminBoards'],
    }),
    deleteAdminBoard: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `${ApiPaths.adminBoards}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminBoards'],
    }),
    getAdminFeatureFlags: build.query<AdminFeatureFlagItem[], void>({
      query: () => ApiPaths.adminFeatureFlags,
      providesTags: ['AdminFeatureFlags'],
    }),
    createAdminFeatureFlag: build.mutation<
      AdminFeatureFlagItem,
      { key: string; name: string; description?: string; isEnabled?: boolean }
    >({
      query: (body) => ({
        url: ApiPaths.adminFeatureFlags,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminFeatureFlags'],
    }),
    updateAdminFeatureFlag: build.mutation<
      AdminFeatureFlagItem,
      { id: number; key?: string; name?: string; description?: string | null; isEnabled?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `${ApiPaths.adminFeatureFlags}/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminFeatureFlags'],
    }),
    deleteAdminFeatureFlag: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `${ApiPaths.adminFeatureFlags}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminFeatureFlags'],
    }),
    getAdminFeatureFlagUsers: build.query<
      Array<{ userId: number; isEnabled: boolean; user: { id: number; userName: string | null; email: string } }>,
      number
    >({
      query: (id) => `${ApiPaths.adminFeatureFlags}/${id}/users`,
      providesTags: (_, __, id) => [{ type: 'AdminFeatureFlags', id: `users-${id}` }],
    }),
    setAdminFeatureFlagUser: build.mutation<
      { ok: boolean },
      { featureFlagId: number; userId: number; isEnabled: boolean }
    >({
      query: ({ featureFlagId, userId, isEnabled }) => ({
        url: `${ApiPaths.adminFeatureFlags}/${featureFlagId}/users`,
        method: 'POST',
        body: { userId, isEnabled },
      }),
      invalidatesTags: (_, __, { featureFlagId }) => [
        'AdminFeatureFlags',
        { type: 'AdminFeatureFlags', id: `users-${featureFlagId}` },
      ],
    }),
    removeAdminFeatureFlagUser: build.mutation<{ ok: boolean }, { featureFlagId: number; userId: number }>({
      query: ({ featureFlagId, userId }) => ({
        url: `${ApiPaths.adminFeatureFlags}/${featureFlagId}/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { featureFlagId }) => [
        'AdminFeatureFlags',
        { type: 'AdminFeatureFlags', id: `users-${featureFlagId}` },
      ],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useUpdateAdminUserMutation,
  useGetAdminFilesQuery,
  useDeleteAdminFileMutation,
  useGetAdminNotesQuery,
  useDeleteAdminNoteMutation,
  useGetAdminInvitesQuery,
  useGetAdminSessionsQuery,
  useGetAdminStatsQuery,
  useGetAdminTasksQuery,
  useDeleteAdminTaskMutation,
  useGetAdminEventsQuery,
  useDeleteAdminEventMutation,
  useGetAdminBoardsQuery,
  useDeleteAdminBoardMutation,
  useGetAdminFeatureFlagsQuery,
  useCreateAdminFeatureFlagMutation,
  useUpdateAdminFeatureFlagMutation,
  useDeleteAdminFeatureFlagMutation,
  useGetAdminFeatureFlagUsersQuery,
  useSetAdminFeatureFlagUserMutation,
  useRemoveAdminFeatureFlagUserMutation,
} = adminApi;
