import { ApiPaths, rtkApi } from '../../../../shared';

export const chatApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    getChats: builder.query<any, any>({
      query: () => ApiPaths.chats,
    }),
  }),
  overrideExisting: false, // ?
});

export const { useGetChatsQuery } = chatApi;
