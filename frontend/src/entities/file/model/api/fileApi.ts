import _ from 'lodash-es';
import { rtkApi } from '../../../../shared/api/rtkApi';
import { addQueryParams } from '../../../../shared/lib/url/addQueryParams/addQueryParams';
import { generateParams } from '../../../../shared/lib/url/generateParams/generateParams';
import { queryParamsSync } from '../../../../shared/consts/queryParamsSync';

export const fileApi = rtkApi.injectEndpoints({
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
      query: (params: Record<string, string>) => {
        params = {
          ..._.omitBy(params, value => value === '' || value === undefined),
          limit: '50',
        };
        addQueryParams(_.pick(params, queryParamsSync));
        const queryParams = generateParams(params);
        return `file${queryParams ? queryParams : ''}`;
      },
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
