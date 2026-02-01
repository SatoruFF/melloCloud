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
  receiver?: Receiver | null;
  lastMessage?: string;
  unreadCount?: number;
}

export interface CreateGroupChatRequest {
  title: string;
  participantIds: number[];
}

export const chatApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    getChats: builder.query<Chat[], void>({
      query: () => ApiPaths.chats,
    }),
    createGroupChat: builder.mutation<Chat, CreateGroupChatRequest>({
      query: body => ({
        url: `${ApiPaths.chats}/group`,
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetChatsQuery, useCreateGroupChatMutation } = chatApi;