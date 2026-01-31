import { ApiPaths, rtkApi } from '../../../../shared';
import type { Notification, UnreadCountResponse } from '../../types/notification';

export const notificationApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => ApiPaths.notifications,
      providesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ApiPaths.notificationsUnreadCount,
      providesTags: ['Notification'],
    }),

    markAsRead: builder.mutation<Notification, number>({
      query: id => ({
        url: `${ApiPaths.notifications}/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: ApiPaths.notificationsReadAll,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    removeNotification: builder.mutation<{ message: string }, number>({
      query: id => ({
        url: `${ApiPaths.notifications}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    clearAllNotifications: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: ApiPaths.notifications,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useRemoveNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationApi;
