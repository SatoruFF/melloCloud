import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Variables } from './localVariables';

const url = Variables.File_URL;

export const fileApi = createApi({
  reducerPath: 'fileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: headers => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: builder => ({
    createDir: builder.mutation<any, any>({
      query: body => ({
        url: 'file',
        method: 'POST',
        body,
      }),
    }),
    downloadFile: builder.mutation<any, any>({
      query: ({ file }) => ({
        url: `file/download?id=${file.id}`,
        method: 'POST',
        responseHandler: async response => {
          const blob = await response.blob(); // получаем бинарные данные ответа
          const url = window.URL.createObjectURL(blob); // создаем URL-адрес для скачивания файла
          const link = document.createElement('a'); // создаем ссылку для скачивания файла
          link.href = url;
          link.download = file.name; // задаем имя файла для скачивания
          link.click(); // автоматически кликаем по ссылке, чтобы скачать файл
          window.URL.revokeObjectURL(url); // освобождаем занятые ресурсы
        },
        cache: 'no-cache',
      }),
    }),
    deleteFile: builder.mutation<any, any>({
      query: ({ file }) => ({
        url: `file/delete?id=${file.id}`,
        method: 'DELETE',
      }),
    }),
    deleteAvatar: builder.mutation<any, void>({
      query: () => ({
        url: `file/avatar`,
        method: 'DELETE',
      }),
    }),
    getFiles: builder.query<any, any>({
      query: (dirId: string) => `file${dirId ? dirId : ''}`,
    }),
  }),
});

export const {
  useGetFilesQuery,
  useCreateDirMutation,
  useDownloadFileMutation,
  useDeleteFileMutation,
  useDeleteAvatarMutation,
} = fileApi;
