/**
 * OpenAPI 3.0 spec for Mello API. All routes under /api/v1 and /v1.
 */
const base = "/api/v1";

export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Mello API",
    version: "1.0.0",
    description: "API documentation for Mello backend. Use `/api/v1` or `/v1` as base path.",
  },
  servers: [{ url: "/", description: "Current host" }],
  tags: [
    { name: "Auth (public)", description: "Login, register, OAuth" },
    { name: "User", description: "Profile, sessions, account" },
    { name: "Files", description: "File storage and uploads" },
    { name: "Tasks", description: "Tasks and kanban" },
    { name: "Columns & Boards", description: "Task columns and boards" },
    { name: "Notes", description: "Notes" },
    { name: "Events", description: "Calendar events" },
    { name: "Chats & Messages", description: "Chats and messages" },
    { name: "Webhooks", description: "Webhooks" },
    { name: "Notifications", description: "Notifications" },
    { name: "Sharing", description: "Resource sharing" },
    { name: "Shared (public)", description: "Public shared resources" },
    { name: "Admin", description: "Admin panel" },
    { name: "Feature flags", description: "Feature flags" },
  ],
  paths: {
    // ----- Public: auth -----
    [base + "/user/login"]: {
      post: { tags: ["Auth (public)"], summary: "Login", requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
    },
    [base + "/user/register"]: {
      post: { tags: ["Auth (public)"], summary: "Register", requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
    },
    [base + "/user/activate"]: {
      get: { tags: ["Auth (public)"], summary: "Activate account", parameters: [{ name: "token", in: "query", schema: { type: "string" } }], responses: { "200": { description: "OK" } } },
    },
    [base + "/user/google"]: { get: { tags: ["Auth (public)"], summary: "Start Google OAuth", responses: { "302": { description: "Redirect" } } } },
    [base + "/user/google/callback"]: { get: { tags: ["Auth (public)"], summary: "Google OAuth callback", responses: { "302": { description: "Redirect" } } } },
    [base + "/user/yandex"]: { get: { tags: ["Auth (public)"], summary: "Start Yandex OAuth", responses: { "302": { description: "Redirect" } } } },
    [base + "/user/yandex/callback"]: { get: { tags: ["Auth (public)"], summary: "Yandex OAuth callback", responses: { "302": { description: "Redirect" } } } },
    [base + "/user/telegram/callback"]: { get: { tags: ["Auth (public)"], summary: "Telegram auth callback", responses: { "200": { description: "OK" } } } },

    // ----- Public: shared -----
    [base + "/shared/public/{token}"]: { get: { tags: ["Shared (public)"], summary: "Get public shared resource", parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/shared/{token}"]: { get: { tags: ["Shared (public)"], summary: "Get shared resource by token", parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/shared/{token}/download"]: { get: { tags: ["Shared (public)"], summary: "Download shared file", parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: user -----
    [base + "/user/auth"]: { get: { tags: ["User"], summary: "Get current user", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/user/refresh"]: { get: { tags: ["User"], summary: "Refresh token", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/user/logout"]: { post: { tags: ["User"], summary: "Logout", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/user/logout-all"]: { post: { tags: ["User"], summary: "Logout all sessions", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/user/sessions"]: { get: { tags: ["User"], summary: "Get sessions", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/user/sessions/{sessionId}"]: { "delete": { tags: ["User"], summary: "Delete session", security: [{ bearerAuth: [] }], parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/user/changeinfo"]: { patch: { tags: ["User"], summary: "Change user info", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/user/changepassword"]: { patch: { tags: ["User"], summary: "Change password", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/user/account"]: { "delete": { tags: ["User"], summary: "Delete account", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/user/search"]: { get: { tags: ["User"], summary: "Search users", security: [{ bearerAuth: [] }], parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/user/{id}"]: { get: { tags: ["User"], summary: "Get user by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: file -----
    [base + "/file"]: {
      get: { tags: ["Files"], summary: "Get files", security: [{ bearerAuth: [] }], parameters: [{ name: "parentId", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } },
      post: { tags: ["Files"], summary: "Create directory", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
    },
    [base + "/file/preview-url"]: { get: { tags: ["Files"], summary: "Get file preview URL", security: [{ bearerAuth: [] }], parameters: [{ name: "fileId", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/file/content"]: { get: { tags: ["Files"], summary: "Get file content", security: [{ bearerAuth: [] }], parameters: [{ name: "fileId", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/file/upload"]: { post: { tags: ["Files"], summary: "Upload file", security: [{ bearerAuth: [] }], requestBody: { content: { "multipart/form-data": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/file/download"]: { post: { tags: ["Files"], summary: "Download file", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/file/delete"]: { "delete": { tags: ["Files"], summary: "Delete file", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/file/avatar"]: {
      post: { tags: ["Files"], summary: "Upload avatar", security: [{ bearerAuth: [] }], requestBody: { content: { "multipart/form-data": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } },
      "delete": { tags: ["Files"], summary: "Delete avatar", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
    },

    // ----- Private: tasks -----
    [base + "/tasks"]: {
      get: { tags: ["Tasks"], summary: "Get all tasks", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } },
      post: { tags: ["Tasks"], summary: "Create task", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
    },
    [base + "/tasks/kanban"]: { get: { tags: ["Tasks"], summary: "Get kanban view", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/stats"]: { get: { tags: ["Tasks"], summary: "Get task stats", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/overdue"]: { get: { tags: ["Tasks"], summary: "Get overdue tasks", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/upcoming"]: { get: { tags: ["Tasks"], summary: "Get upcoming tasks", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/search"]: { get: { tags: ["Tasks"], summary: "Search tasks", security: [{ bearerAuth: [] }], parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/priority/{priority}"]: { get: { tags: ["Tasks"], summary: "Get by priority", security: [{ bearerAuth: [] }], parameters: [{ name: "priority", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/status/{status}"]: { get: { tags: ["Tasks"], summary: "Get by status", security: [{ bearerAuth: [] }], parameters: [{ name: "status", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/column/{columnId}"]: { get: { tags: ["Tasks"], summary: "Get by column", security: [{ bearerAuth: [] }], parameters: [{ name: "columnId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/{id}"]: {
      get: { tags: ["Tasks"], summary: "Get task by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } },
      put: { tags: ["Tasks"], summary: "Update task", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
      "delete": { tags: ["Tasks"], summary: "Delete task", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/{id}/toggle"]: { patch: { tags: ["Tasks"], summary: "Toggle task complete", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/tasks/{id}/move"]: { patch: { tags: ["Tasks"], summary: "Move task to column", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/tasks/batch-update"]: { patch: { tags: ["Tasks"], summary: "Batch update tasks", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },

    // ----- Private: columns -----
    [base + "/columns"]: {
      get: { tags: ["Columns & Boards"], summary: "Get all columns", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } },
      post: { tags: ["Columns & Boards"], summary: "Create column", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
    },
    [base + "/columns/stats"]: { get: { tags: ["Columns & Boards"], summary: "Get column stats", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/columns/reorder"]: { patch: { tags: ["Columns & Boards"], summary: "Reorder columns", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/columns/move-task"]: { patch: { tags: ["Columns & Boards"], summary: "Move task between columns", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/columns/{id}"]: {
      get: { tags: ["Columns & Boards"], summary: "Get column by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } },
      put: { tags: ["Columns & Boards"], summary: "Update column", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } },
      "delete": { tags: ["Columns & Boards"], summary: "Delete column", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
    },

    // ----- Private: boards -----
    [base + "/boards"]: {
      get: { tags: ["Columns & Boards"], summary: "Get all boards", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } },
      post: { tags: ["Columns & Boards"], summary: "Create board", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
    },
    ["/api/v1/boards/{id}"]: {
      get: { tags: ["Columns & Boards"], summary: "Get board by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } },
      put: { tags: ["Columns & Boards"], summary: "Update board", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } },
      "delete": { tags: ["Columns & Boards"], summary: "Delete board", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    },

    // ----- Private: notes -----
    [base + "/notes"]: {
      get: { tags: ["Notes"], summary: "Get user notes", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } },
      post: { tags: ["Notes"], summary: "Create note", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    },
    [base + "/notes/search"]: { get: { tags: ["Notes"], summary: "Search notes", security: [{ bearerAuth: [] }], parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/notes/{noteId}"]: {
      get: { tags: ["Notes"], summary: "Get note", security: [{ bearerAuth: [] }], parameters: [{ name: "noteId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
      put: { tags: ["Notes"], summary: "Update note", security: [{ bearerAuth: [] }], parameters: [{ name: "noteId", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
      "delete": { tags: ["Notes"], summary: "Delete note", security: [{ bearerAuth: [] }], parameters: [{ name: "noteId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    },

    // ----- Private: events -----
    [base + "/events"]: {
      get: { tags: ["Events"], summary: "Get user events", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } },
      post: { tags: ["Events"], summary: "Create event", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    },
    [base + "/events/range"]: { get: { tags: ["Events"], summary: "Get events by date range", security: [{ bearerAuth: [] }], parameters: [{ name: "start", in: "query", schema: { type: "string" } }, { name: "end", in: "query", schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/events/search"]: { get: { tags: ["Events"], summary: "Search events", security: [{ bearerAuth: [] }], parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/events/{eventId}"]: {
      get: { tags: ["Events"], summary: "Get event", security: [{ bearerAuth: [] }], parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
      put: { tags: ["Events"], summary: "Update event", security: [{ bearerAuth: [] }], parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
      "delete": { tags: ["Events"], summary: "Delete event", security: [{ bearerAuth: [] }], parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    },
    [base + "/events/{eventId}/attendees"]: {
      post: { tags: ["Events"], summary: "Add attendee", security: [{ bearerAuth: [] }], parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    },
    [base + "/events/{eventId}/attendees/{attendeeUserId}"]: { "delete": { tags: ["Events"], summary: "Remove attendee", security: [{ bearerAuth: [] }], parameters: [{ name: "eventId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: chats & messages -----
    [base + "/chats"]: { get: { tags: ["Chats & Messages"], summary: "Get user chats", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/chats/group"]: { post: { tags: ["Chats & Messages"], summary: "Create group chat", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/messages"]: { get: { tags: ["Chats & Messages"], summary: "Get messages", security: [{ bearerAuth: [] }], parameters: [{ name: "chatId", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: webhooks -----
    [base + "/webhooks"]: {
      get: { tags: ["Webhooks"], summary: "Get user webhooks", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } },
      post: { tags: ["Webhooks"], summary: "Create webhook", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    },
    [base + "/webhooks/events"]: { get: { tags: ["Webhooks"], summary: "Get available webhook events", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/webhooks/scheduled"]: { get: { tags: ["Webhooks"], summary: "Get scheduled webhooks", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/webhooks/{webhookId}"]: {
      get: { tags: ["Webhooks"], summary: "Get webhook", security: [{ bearerAuth: [] }], parameters: [{ name: "webhookId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } },
      put: { tags: ["Webhooks"], summary: "Update webhook", security: [{ bearerAuth: [] }], parameters: [{ name: "webhookId", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
      "delete": { tags: ["Webhooks"], summary: "Delete webhook", security: [{ bearerAuth: [] }], parameters: [{ name: "webhookId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    },
    [base + "/webhooks/{webhookId}/executions"]: { get: { tags: ["Webhooks"], summary: "Get webhook executions", security: [{ bearerAuth: [] }], parameters: [{ name: "webhookId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },
    [base + "/webhooks/{webhookId}/test"]: { post: { tags: ["Webhooks"], summary: "Test webhook", security: [{ bearerAuth: [] }], parameters: [{ name: "webhookId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: notifications -----
    [base + "/notifications"]: {
      get: { tags: ["Notifications"], summary: "Get all notifications", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
      "delete": { tags: ["Notifications"], summary: "Clear all notifications", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    },
    [base + "/notifications/unread-count"]: { get: { tags: ["Notifications"], summary: "Get unread count", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/notifications/read-all"]: { patch: { tags: ["Notifications"], summary: "Mark all as read", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/notifications/{id}/read"]: { patch: { tags: ["Notifications"], summary: "Mark as read", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/notifications/{id}"]: { "delete": { tags: ["Notifications"], summary: "Remove notification", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: sharing -----
    [base + "/sharing"]: { post: { tags: ["Sharing"], summary: "Share resource", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/sharing/permissions/{resourceType}/{resourceId}"]: { get: { tags: ["Sharing"], summary: "Get resource permissions", security: [{ bearerAuth: [] }], parameters: [{ name: "resourceType", in: "path", required: true, schema: { type: "string" } }, { name: "resourceId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/sharing/permissions/{permissionId}"]: {
      patch: { tags: ["Sharing"], summary: "Update permission", security: [{ bearerAuth: [] }], parameters: [{ name: "permissionId", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } },
      "delete": { tags: ["Sharing"], summary: "Revoke permission", security: [{ bearerAuth: [] }], parameters: [{ name: "permissionId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    },
    [base + "/sharing/public-link"]: { post: { tags: ["Sharing"], summary: "Create public link", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    [base + "/sharing/public-link/{resourceType}/{resourceId}"]: { "delete": { tags: ["Sharing"], summary: "Delete public link", security: [{ bearerAuth: [] }], parameters: [{ name: "resourceType", in: "path", required: true, schema: { type: "string" } }, { name: "resourceId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/sharing/shared-with-me"]: { get: { tags: ["Sharing"], summary: "Get shared with me", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/sharing/shared-by-me"]: { get: { tags: ["Sharing"], summary: "Get shared by me", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    [base + "/sharing/check-permission/{resourceType}/{resourceId}"]: { get: { tags: ["Sharing"], summary: "Check permission", security: [{ bearerAuth: [] }], parameters: [{ name: "resourceType", in: "path", required: true, schema: { type: "string" } }, { name: "resourceId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/sharing/activity/{resourceType}/{resourceId}"]: { get: { tags: ["Sharing"], summary: "Get sharing activity", security: [{ bearerAuth: [] }], parameters: [{ name: "resourceType", in: "path", required: true, schema: { type: "string" } }, { name: "resourceId", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: admin -----
    [base + "/admin/users"]: { get: { tags: ["Admin"], summary: "List users", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/users/{id}"]: {
      get: { tags: ["Admin"], summary: "Get user", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
      patch: { tags: ["Admin"], summary: "Update user", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { "200": { description: "OK" } } } },
    },
    [base + "/admin/files"]: { get: { tags: ["Admin"], summary: "List files", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/files/{id}"]: { "delete": { tags: ["Admin"], summary: "Delete file", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/notes"]: { get: { tags: ["Admin"], summary: "List notes", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/notes/{id}"]: { "delete": { tags: ["Admin"], summary: "Delete note", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/invites"]: { get: { tags: ["Admin"], summary: "List invites", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/sessions"]: { get: { tags: ["Admin"], summary: "List sessions", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/tasks"]: { get: { tags: ["Admin"], summary: "List tasks", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/tasks/{id}"]: { "delete": { tags: ["Admin"], summary: "Delete task", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/events"]: { get: { tags: ["Admin"], summary: "List events", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/events/{id}"]: { "delete": { tags: ["Admin"], summary: "Delete event", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    [base + "/admin/boards"]: { get: { tags: ["Admin"], summary: "List boards", security: [{ bearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },

    // ----- Private: feature flags -----
    [base + "/feature-flags"]: { get: { tags: ["Feature flags"], summary: "Get feature flags", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } } },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
};
