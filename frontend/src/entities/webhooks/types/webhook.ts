export interface WebhookListSchema {
  webhooks: IWebhook[];
  selectedWebhook: IWebhook | null;
  executions: WebhookExecution[];
  limit: number;
  offset: number;
  hasMore: boolean;
  loading: boolean;
}

export type WebhookEvent =
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_DELETED'
  | 'EVENT_REMINDER_1H'
  | 'EVENT_REMINDER_1D'
  | 'EVENT_REMINDER_CUSTOM'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_OVERDUE'
  | 'TASK_DUE_SOON'
  | 'NOTE_CREATED'
  | 'NOTE_UPDATED'
  | 'NOTE_SHARED'
  | 'FILE_UPLOADED'
  | 'FILE_SHARED'
  | 'CUSTOM';

export type WebhookStatus = 'ACTIVE' | 'INACTIVE' | 'FAILED' | 'PAUSED';

export type WebhookMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IWebhook {
  id: number;
  name: string;
  description?: string;
  url: string;
  method: WebhookMethod;
  events: WebhookEvent[];
  filters?: Record<string, any>;
  headers?: Record<string, string>;
  retryCount: number;
  retryDelay: number;
  status: WebhookStatus;
  lastTriggeredAt?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookExecution {
  id: number;
  webhookId: number;
  event: WebhookEvent;
  payload: any;
  statusCode?: number;
  response?: any;
  error?: string;
  duration?: number;
  attempt: number;
  success: boolean;
  triggeredAt: string;
}

export interface ScheduledWebhook {
  id: number;
  webhookId: number;
  resourceType: string;
  resourceId: number;
  scheduledFor: string;
  executed: boolean;
  executedAt?: string;
  event: WebhookEvent;
  payload: any;
  createdAt: string;
  webhook?: {
    id: number;
    name: string;
  };
}

export interface AvailableEvent {
  event: WebhookEvent;
  category: string;
  description: string;
}

export interface WebhookProps {
  webhook: IWebhook;
  onEdit?: (webhook: IWebhook) => void;
  onDelete?: (webhookId: number) => void;
  onTest?: (webhookId: number) => void;
}

export interface CreateWebhookRequest {
  name: string;
  description?: string;
  url: string;
  method: string;
  events: string[];
  filters?: any;
  headers?: any;
  retryCount?: number;
  retryDelay?: number;
}
