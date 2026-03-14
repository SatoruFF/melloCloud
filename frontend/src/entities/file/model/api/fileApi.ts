import { omitBy, pick } from 'lodash-es';
import { ApiPaths, rtkApi } from '../../../../shared';
import { addQueryParams, generateParams, queryParamsSync } from '../../../../shared';
import { IFile } from '../types/file';

export const fileApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    createDir: builder.mutation<IFile, { name: string; parentId?: string }>({
      query: body => ({
        url: ApiPaths.file,
        method: 'POST',
        body,
      }),
    }),
    downloadFile: builder.mutation<void, { file: IFile }>({
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
    deleteFile: builder.mutation<{ success: boolean }, { file: IFile }>({
      query: ({ file }) => ({
        url: `${ApiPaths.fileDelete}?id=${file.id}`,
        method: 'DELETE',
      }),
    }),
    deleteAvatar: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: ApiPaths.fileAvatar,
        method: 'DELETE',
      }),
    }),
    getFiles: builder.query<IFile[], Record<string, string>>({
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
