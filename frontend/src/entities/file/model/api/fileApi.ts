import { omitBy, pick } from 'lodash-es';
import { ApiPaths, rtkApi } from '../../../../shared';
import { addQueryParams, generateParams, queryParamsSync } from '../../../../shared';

export const fileApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    createDir: builder.mutation<any, any>({
      query: body => ({
        url: ApiPaths.file,
        method: 'POST',
        body,
      }),
    }),
    downloadFile: builder.mutation<any, any>({
      query: ({ file }) => ({
        url: `${ApiPaths.fileDownload}?id=${file.id}`,
        method: 'POST',
        responseHandler: async response => {
          const blob = await response.blob(); // get binary response data
          const url = window.URL.createObjectURL(blob); // create URL for file download
          const link = document.createElement('a'); // create download link element
          link.href = url;
          link.download = file.name; // set filename for download
          link.click(); // automatically trigger download
          window.URL.revokeObjectURL(url); // free up resources
        },
        cache: 'no-cache',
      }),
    }),
    deleteFile: builder.mutation<any, any>({
      query: ({ file }) => ({
        url: `${ApiPaths.fileDelete}?id=${file.id}`,
        method: 'DELETE',
      }),
    }),
    deleteAvatar: builder.mutation<any, void>({
      query: () => ({
        url: ApiPaths.fileAvatar,
        method: 'DELETE',
      }),
    }),
    getFiles: builder.query<any, any>({
      query: (params: Record<string, string>) => {
        // sanitize params
        const sanitizedParams = {
          ...omitBy(params, value => value === '' || value === undefined),
          limit: '50',
        };

        addQueryParams(pick(sanitizedParams, queryParamsSync));
        const queryParams = generateParams(sanitizedParams);

        return ApiPaths.file + (queryParams || '');
      },
    }),
    getFilePreviewUrl: builder.query<{ url: string }, number | string>({
      query: (fileId) => ({
        url: `${ApiPaths.filePreviewUrl}?id=${fileId}`,
      }),
    }),
    getFileContent: builder.query<Blob, number | string>({
      query: (fileId) => ({
        url: `${ApiPaths.fileContent}?id=${fileId}`,
        responseHandler: async (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetFilesQuery,
  useLazyGetFilePreviewUrlQuery,
  useLazyGetFileContentQuery,
  useCreateDirMutation,
  useDownloadFileMutation,
  useDeleteFileMutation,
  useDeleteAvatarMutation,
} = fileApi;
