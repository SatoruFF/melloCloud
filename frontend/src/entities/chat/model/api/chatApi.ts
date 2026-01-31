import { ApiPaths, rtkApi } from '../../../../shared';

// FIXME: Эти типы ужде вроде есть
export interface Receiver {
  id: number;
  userName: string;
  avatar?: string;
}

export interface Chat {
  id: number;
  title?: string;
  isGroup?: boolean;
  receiver?: Receiver;
  lastMessage?: string;
  unreadCount?: number;
}

export const chatApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    getChats: builder.query<Chat[], void>({
      query: () => ApiPaths.chats,
    }),
  }),
  overrideExisting: false,
});

export const { useGetChatsQuery } = chatApi;