const isLocalhost = window.location.hostname.includes("localhost") || window.location.hostname === "127.0.0.1";

// Формируем базовый HTTP URL
const _baseUrl: string = isLocalhost ? "http://localhost:10000/api/v1" : "https://api.mellocloud.net/v1";

// Формируем базовый WS URL
const _baseSocketUrl: string = isLocalhost ? "ws://localhost:10000" : "wss://api.mellocloud.net";

export const Variables = {
  User_URL: `${_baseUrl}/user/`,
  File_URL: `${_baseUrl}/`,
  UpAvatar_URL: `${_baseUrl}/file/avatar`,
  FileUpload_URL: `${_baseUrl}/file/upload`,
  Message_URL: `${_baseUrl}/messages`,
  Socket_URL: `${_baseSocketUrl}`,
} as const;
