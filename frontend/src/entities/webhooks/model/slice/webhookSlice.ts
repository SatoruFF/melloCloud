import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { IWebhook, WebhookExecution, WebhookListSchema } from '../../types/webhook';

const initialState: WebhookListSchema = {
  webhooks: [],
  selectedWebhook: null,
  executions: [],
  limit: 50,
  offset: 0,
  hasMore: false,
  loading: false,
};

export const webhookSlice = createSlice({
  name: 'webhooks',
  initialState,
  reducers: {
    setWebhooks: (state, action: PayloadAction<IWebhook[]>) => {
      state.webhooks = action.payload;
    },
    addWebhooks: (state, action: PayloadAction<IWebhook[]>) => {
      if (action?.payload) {
        state.webhooks.push(...action.payload);
      }
    },
    addWebhook: (state, action: PayloadAction<IWebhook>) => {
      state.webhooks.unshift(action.payload);
    },
    updateWebhook: (state, action: PayloadAction<IWebhook>) => {
      const index = state.webhooks.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.webhooks[index] = action.payload;
      }
    },
    removeWebhook: (state, action: PayloadAction<number>) => {
      state.webhooks = state.webhooks.filter(w => w.id !== action.payload);
    },
    setSelectedWebhook: (state, action: PayloadAction<IWebhook | null>) => {
      state.selectedWebhook = action.payload;
    },
    setExecutions: (state, action: PayloadAction<WebhookExecution[]>) => {
      state.executions = action.payload;
    },
    addExecutions: (state, action: PayloadAction<WebhookExecution[]>) => {
      if (action?.payload) {
        state.executions.push(...action.payload);
      }
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
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
} = webhookSlice.actions;

export const { reducer: webhookReducer } = webhookSlice;

export default webhookSlice.reducer;
