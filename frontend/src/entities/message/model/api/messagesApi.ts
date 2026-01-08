import { ApiPaths, rtkApi } from '../../../../shared';
import type { Message } from '../../types/message';

interface SendMessageRequest {
  chatId: string | number;
  text: string;
  receiverId: string | number;
}

interface DeleteMessageResponse {
  messageId: string;
}

interface EditMessageRequest {
  messageId: string;
  newText: string;
}

export const messageApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: body => ({
        url: ApiPaths.messages,
        method: 'POST',
        body,
      }),
    }),
    deleteMessage: builder.mutation<DeleteMessageResponse, { messageId: string }>({
      query: ({ messageId }) => ({
        url: `${ApiPaths.messages}/delete?id=${messageId}`,
        method: 'DELETE',
        body: { messageId },
      }),
    }),
    getMessages: builder.query<Message[], string>({
      query: (chatId: string) => `${ApiPaths.messages}?chatId=${chatId}`,
    }),
    editMessage: builder.mutation<Message, EditMessageRequest>({
      query: ({ messageId, newText }) => ({
        url: `${ApiPaths.messages}/edit`,
        method: 'PUT',
        body: { messageId, newText },
      }),
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
} = messageApi;
