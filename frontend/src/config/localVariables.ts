const isLocalhost = window.location.hostname.includes("localhost") || window.location.hostname === "127.0.0.1";

// Формируем базовый URL с учетом протокола
const _baseUrl: string = isLocalhost
  ? "http://localhost:10000/core" // Указываем http для локального хоста
  : "https://api.mellocloud.net/core"; // https для продакшена

export const Variables = {
  User_URL: `${_baseUrl}/api/user/`,
  File_URL: `${_baseUrl}/api/`,
  UpAvatar_URL: `${_baseUrl}/api/file/avatar`,
  FileUpload_URL: `${_baseUrl}/api/file/upload`,
} as const;
