const isLocalhost = window.location.hostname.includes("localhost") || window.location.hostname === "127.0.0.1";

// Формируем базовый HTTP URL
const _baseUrl: string = isLocalhost ? "http://localhost:10000/api/v1" : "https://api.mellocloud.net/v1";

// Формируем базовый WS URL
const _baseSocketUrl: string = isLocalhost ? "ws://localhost:10000" : "wss://api.mellocloud.net";

export const Variables = {
  // ========================================
  // БАЗОВЫЕ URL
  // ========================================
  BASE_API_URL: _baseUrl,
  BASE_SOCKET_URL: _baseSocketUrl,

  // ========================================
  // USER ENDPOINTS
  // ========================================

  // Приватные user эндпоинты (требуют авторизации)
  User_URL: `${_baseUrl}/user`, // базовый путь для user API
  User_Auth: `${_baseUrl}/user/auth`, // GET - получить текущего юзера
  User_Refresh: `${_baseUrl}/user/refresh`, // GET - обновить токен
  User_Logout: `${_baseUrl}/user/logout`, // POST - выйти
  User_LogoutAll: `${_baseUrl}/user/logout-all`, // POST - выйти со всех устройств
  User_Sessions: `${_baseUrl}/user/sessions`, // GET - список сессий
  User_Search: `${_baseUrl}/user/search`, // GET - поиск пользователей
  User_ChangeInfo: `${_baseUrl}/user/changeinfo`, // PATCH - изменить инфо

  // ========================================
  // AUTH ENDPOINTS (публичные)
  // ========================================

  // Стандартная авторизация
  Auth_Register: `${_baseUrl}/auth/register`, // POST - регистрация
  Auth_Login: `${_baseUrl}/auth/login`, // POST - логин
  Auth_Activate: `${_baseUrl}/auth/activate`, // GET - активация

  // OAuth провайдеры
  Auth_Google: `${_baseUrl}/auth/google`, // GET - OAuth Google
  Auth_Google_Callback: `${_baseUrl}/auth/google/callback`,
  Auth_Telegram: `${_baseUrl}/auth/telegram`, // GET - OAuth Telegram
  Auth_Telegram_Callback: `${_baseUrl}/auth/telegram/callback`,
  Auth_Yandex: `${_baseUrl}/auth/yandex`, // GET - OAuth Yandex
  Auth_Yandex_Callback: `${_baseUrl}/auth/yandex/callback`,

  // ========================================
  // FILE ENDPOINTS
  // ========================================
  File_URL: `${_baseUrl}/file`,
  UpAvatar_URL: `${_baseUrl}/file/avatar`,
  FileUpload_URL: `${_baseUrl}/file/upload`,

  // ========================================
  // MESSAGE & SOCKET ENDPOINTS
  // ========================================
  Message_URL: `${_baseUrl}/messages`,
  Socket_URL: `${_baseSocketUrl}`,
} as const;
