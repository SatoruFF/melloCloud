const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1';

// Формируем базовый URL с учетом протокола
const _baseUrl: string = isLocalhost
  ? 'http://localhost:10000/api' // Указываем http для локального хоста
  : 'https://api.mellocloud.net'; // https для продакшена

export const Variables = {
  User_URL: `${_baseUrl}/user/`,
  File_URL: `${_baseUrl}/`,
  UpAvatar_URL: `${_baseUrl}/file/avatar`,
  FileUpload_URL: `${_baseUrl}/file/upload`,
  Message_URL: `${_baseUrl}/messages`,
} as const;
