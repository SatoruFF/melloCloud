const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1';

// Base HTTP URL
const _baseUrl: string = isLocalhost ? 'http://localhost:10000/api/v1' : 'https://api.mellocloud.net/v1';

// Base WebSocket URL
const _baseSocketUrl: string = isLocalhost ? 'ws://localhost:10000' : 'wss://api.mellocloud.net';

// ========================================
// RELATIVE PATHS (for RTK Query)
// ========================================
export const ApiPaths = {
  // User
  user: 'user',
  userAuth: 'user/auth',
  userRefresh: 'user/refresh',
  userLogout: 'user/logout',
  userLogoutAll: 'user/logout-all',
  userSessions: 'user/sessions',
  userSearch: 'user/search',
  userChangeInfo: 'user/changeinfo',

  // Auth
  register: 'user/register',
  login: 'user/login',
  activate: 'user/activate',

  // OAuth
  google: 'user/google',
  googleCallback: 'user/google/callback',
  telegram: 'user/telegram',
  telegramCallback: 'user/telegram/callback',
  yandex: 'user/yandex',
  yandexCallback: 'user/yandex/callback',

  // File
  file: 'file',
  fileUpload: 'file/upload',
  fileDownload: 'file/download',
  fileDelete: 'file/delete',
  fileAvatar: 'file/avatar',

  // Chat & Messages
  chats: 'chats',
  messages: 'messages',

  // Boards (Kanban)
  boards: 'boards',

  // Tasks
  tasks: 'tasks',
  tasksKanban: 'tasks/kanban',
  tasksStats: 'tasks/stats',
  tasksOverdue: 'tasks/overdue',
  tasksUpcoming: 'tasks/upcoming',
  tasksSearch: 'tasks/search',
  tasksPriority: 'tasks/priority',
  tasksStatus: 'tasks/status',
  tasksColumn: 'tasks/column',
  tasksBatchUpdate: 'tasks/batch-update',

  // Columns
  columns: 'columns',
  columnsReorder: 'columns/reorder',
  columnsMoveTask: 'columns/move-task',
  columnsStats: 'columns/stats',

  // Notes
  notes: 'notes',
  notesSearch: 'notes/search',

  // Events
  events: 'events',
  eventsRange: 'events/range',
  eventsSearch: 'events/search',

  // Webhooks
  webhooks: 'webhooks',
  webhooksEvents: 'webhooks/events',
  webhooksScheduled: 'webhooks/scheduled',

  // Notifications
  notifications: 'notifications',
  notificationsUnreadCount: 'notifications/unread-count',
  notificationsReadAll: 'notifications/read-all',

  // Sharing
  sharing: 'sharing',
  sharingPermissions: 'sharing/permissions',
  sharingPublicLink: 'sha/public-link',
  sharingSharedWithMe: 'sharing/shared-with-me',
  sharingSharedByMe: 'sharing/shared-by-me',
  sharingCheckPermission: 'sharing/check-permission',
  sharingActivity: 'sharing/activity',
  sharingPublic: '/shared',
} as const;

// ========================================
// FULL URLs (for legacy code / userApi)
// ========================================
export const Variables = {
  // Base URLs
  BASE_API_URL: _baseUrl,
  BASE_SOCKET_URL: _baseSocketUrl,

  // User endpoints (full URLs)
  User_URL: `${_baseUrl}/user`,
  User_Auth: `${_baseUrl}/user/auth`,
  User_Refresh: `${_baseUrl}/user/refresh`,
  User_Logout: `${_baseUrl}/user/logout`,
  User_LogoutAll: `${_baseUrl}/user/logout-all`,
  User_Sessions: `${_baseUrl}/user/sessions`,
  User_Search: `${_baseUrl}/user/search`,
  User_ChangeInfo: `${_baseUrl}/user/changeinfo`,
  User_GetById: `${_baseUrl}/user`,

  // Auth endpoints
  Auth_Register: `${_baseUrl}/user/register`,
  Auth_Login: `${_baseUrl}/user/login`,
  Auth_Activate: `${_baseUrl}/user/activate`,

  // OAuth
  Auth_Google: `${_baseUrl}/user/google`,
  Auth_Google_Callback: `${_baseUrl}/user/google/callback`,
  Auth_Telegram: `${_baseUrl}/user/telegram`,
  Auth_Telegram_Callback: `${_baseUrl}/user/telegram/callback`,
  Auth_Yandex: `${_baseUrl}/user/yandex`,
  Auth_Yandex_Callback: `${_baseUrl}/user/yandex/callback`,

  // File
  File_URL: `${_baseUrl}/file`,
  File_Upload: `${_baseUrl}/file/upload`,
  File_Download: `${_baseUrl}/file/download`,
  File_UploadAvatar: `${_baseUrl}/file/avatar`,
  File_DeleteAvatar: `${_baseUrl}/file/avatar`,

  // WebSocket: chat на /ws/chat, коллаборация заметок на /ws/notes
  Socket_URL: `${_baseSocketUrl}/ws/chat`,
  Socket_Notes_URL: `${_baseSocketUrl}/ws/notes`,

  // Misc
  TELEGRAM_BOT_NAME: import.meta.env.VITE_TELEGRAM_BOT_NAME || 'YourBotName',
} as const;
