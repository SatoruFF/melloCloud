import _ from "lodash-es";
import { rtkApi } from "../../../../shared/api/rtkApi";

export const chatApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<any, any>({
      query: () => "chats",
    }),
  }),
  overrideExisting: false, // ?
});

export const { useGetChatsQuery } = chatApi;
