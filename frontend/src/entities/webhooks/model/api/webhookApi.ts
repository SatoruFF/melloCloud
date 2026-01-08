import { omitBy, pick } from 'lodash-es';
import { rtkApi } from '../../../../shared/api/rtkApi';
import { addQueryParams } from '../../../../shared/lib/url/addQueryParams/addQueryParams';
import { generateParams } from '../../../../shared/lib/url/generateParams/generateParams';
import { queryParamsSync } from '../../../../shared/consts/queryParamsSync';
import { ApiPaths } from '../../../../shared';
import { CreateWebhookRequest, IWebhook, WebhookExecution } from '../../types/webhook';

export const webhookApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // Get all webhooks
    getWebhooks: builder.query<IWebhook[], Record<string, string>>({
      query: (inputParams = {}) => {
        const cleanedParams = omitBy(inputParams, value => value === '' || value === undefined);
        const params = {
          ...cleanedParams,
          limit: '50',
        };
        addQueryParams(pick(params, queryParamsSync));
        const queryParams = generateParams(params);
        return `${ApiPaths.webhooks}${queryParams || ''}`;
      },
    }),

    // Get single webhook
    getWebhook: builder.query<IWebhook, number>({
      query: webhookId => `${ApiPaths.webhooks}/${webhookId}`,
    }),

    // Create webhook
    createWebhook: builder.mutation<IWebhook, CreateWebhookRequest>({
      query: body => ({
        url: ApiPaths.webhooks,
        method: 'POST',
        body,
      }),
    }),

    // Update webhook
    updateWebhook: builder.mutation<IWebhook, { webhookId: number; data: Partial<CreateWebhookRequest> }>({
      query: ({ webhookId, data }) => ({
        url: `${ApiPaths.webhooks}/${webhookId}`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Delete webhook
    deleteWebhook: builder.mutation<{ message: string }, number>({
      query: webhookId => ({
        url: `${ApiPaths.webhooks}/${webhookId}`,
        method: 'DELETE',
      }),
    }),

    // Test webhook
    testWebhook: builder.mutation<WebhookExecution, number>({
      query: webhookId => ({
        url: `${ApiPaths.webhooks}/${webhookId}/test`,
        method: 'POST',
      }),
    }),

    // Get webhook executions history
    getWebhookExecutions: builder.query<WebhookExecution[], { webhookId: number; limit?: number; offset?: number }>({
      query: ({ webhookId, limit = 50, offset = 0 }) => {
        const params = generateParams({ limit: String(limit), offset: String(offset) });
        return `${ApiPaths.webhooks}/${webhookId}/executions${params}`;
      },
    }),

    // Get scheduled webhooks
    getScheduledWebhooks: builder.query<any[], void>({
      query: () => `${ApiPaths.webhooks}/scheduled`,
    }),

    // Get available events
    getAvailableEvents: builder.query<string[], void>({
      query: () => `${ApiPaths.webhooks}/events`,
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
