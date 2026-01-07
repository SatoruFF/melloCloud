// entities/webhook/index.ts

export {
  useGetWebhooksQuery,
  useGetWebhookQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
  useGetWebhookExecutionsQuery,
  useGetScheduledWebhooksQuery,
  useGetAvailableEventsQuery,
} from './model/api/webhookApi';

export {
  setWebhooks,
  addWebhooks,
  addWebhook,
  updateWebhook,
  removeWebhook,
  setSelectedWebhook,
  setExecutions,
  addExecutions,
  setLimit,
  setOffset,
  setLoading,
  setHasMore,
} from './model/slice/webhookSlice';

export {
  getWebhooksSelector,
  getWebhooksLimitSelector,
  getWebhooksOffsetSelector,
  getWebhooksLoadingSelector,
  getWebhooksHasMoreSelector,
  getSelectedWebhookSelector,
  getWebhookExecutionsSelector,
} from './model/selectors/getWebhooks';

export type {
  WebhookListSchema,
  IWebhook,
  WebhookExecution,
  ScheduledWebhook,
  AvailableEvent,
  WebhookProps,
  WebhookEvent,
  WebhookStatus,
  WebhookMethod,
} from './types/webhook';

export { default as Webhook } from './ui/Webhook';
