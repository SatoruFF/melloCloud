import type { StateSchema } from '../../../../app/store/types/state';

export const getWebhooksSelector = (state: StateSchema) => state.webhooks?.webhooks || [];
export const getWebhooksLimitSelector = (state: StateSchema) => state.webhooks?.limit ?? 50;
export const getWebhooksOffsetSelector = (state: StateSchema) => state.webhooks?.offset ?? 0;
export const getWebhooksLoadingSelector = (state: StateSchema) => state.webhooks?.loading ?? false;
export const getWebhooksHasMoreSelector = (state: StateSchema) => state.webhooks?.hasMore ?? false;
export const getSelectedWebhookSelector = (state: StateSchema) => state.webhooks?.selectedWebhook || null;
export const getWebhookExecutionsSelector = (state: StateSchema) => state.webhooks?.executions || [];
