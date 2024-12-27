const _baseUrl: string = "mellocloud.net/core";

export const Variables = {
  User_URL: `https://${_baseUrl}/api/user/`,
  File_URL: `https://${_baseUrl}/api/`,
  UpAvatar_URL: `https://${_baseUrl}/api/file/avatar`,
  FileUpload_URL: `https://${_baseUrl}/api/file/upload`,
} as const;

// export enum Variables {
//     User_URL = `http://localhost:10000/api/user/`,
//     File_URL = `http://localhost:10000/api/`,
//     UpAvatar_URL = `http://localhost:10000/api/file/avatar`,
//     FileUpload_URL = `http://localhost:10000/api/file/upload`,
// }
