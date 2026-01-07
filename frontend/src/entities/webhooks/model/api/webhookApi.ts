import _ from 'lodash-es';
import { rtkApi } from '../../../../shared/api/rtkApi';
import { addQueryParams } from '../../../../shared/lib/url/addQueryParams/addQueryParams';
import { generateParams } from '../../../../shared/lib/url/generateParams/generateParams';
import { queryParamsSync } from '../../../../shared/consts/queryParamsSync';

export const webhookApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // Получить все webhooks
    getWebhooks: builder.query<any, any>({
      query: (params: Record<string, string> = {}) => {
        params = {
          ..._.omitBy(params, value => value === '' || value === undefined),
          limit: '50',
        };
        addQueryParams(_.pick(params, queryParamsSync));
        const queryParams = generateParams(params);
        return `webhooks${queryParams ? queryParams : ''}`;
      },
    }),

    // Получить один webhook
    getWebhook: builder.query<any, number>({
      query: webhookId => `webhooks/${webhookId}`,
    }),

    // Создать webhook
    createWebhook: builder.mutation<any, any>({
      query: body => ({
        url: 'webhooks',
        method: 'POST',
        body,
      }),
    }),

    // Обновить webhook
    updateWebhook: builder.mutation<any, { webhookId: number; data: any }>({
      query: ({ webhookId, data }) => ({
        url: `webhooks/${webhookId}`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Удалить webhook
    deleteWebhook: builder.mutation<any, number>({
      query: webhookId => ({
        url: `webhooks/${webhookId}`,
        method: 'DELETE',
      }),
    }),

    // Тестовый запуск webhook
    testWebhook: builder.mutation<any, number>({
      query: webhookId => ({
        url: `webhooks/${webhookId}/test`,
        method: 'POST',
      }),
    }),

    // Получить историю выполнений
    getWebhookExecutions: builder.query<any, { webhookId: number; limit?: number; offset?: number }>({
      query: ({ webhookId, limit = 50, offset = 0 }) => {
        const params = generateParams({ limit: String(limit), offset: String(offset) });
        return `webhooks/${webhookId}/executions${params}`;
      },
    }),

    // Получить запланированные webhooks
    getScheduledWebhooks: builder.query<any, void>({
      query: () => 'webhooks/scheduled',
    }),

    // Получить доступные события
    getAvailableEvents: builder.query<any, void>({
      query: () => 'webhooks/events',
    }),
  }),
});

export const {
  useGetWebhooksQuery,
  useGetWebhookQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
  useGetWebhookExecutionsQuery,
  useGetScheduledWebhooksQuery,
  useGetAvailableEventsQuery,
} = webhookApi;
