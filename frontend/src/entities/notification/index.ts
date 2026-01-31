export {
  notificationApi,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useRemoveNotificationMutation,
  useClearAllNotificationsMutation,
} from './model/api/notificationApi';
export type { Notification, UnreadCountResponse } from './types/notification';
