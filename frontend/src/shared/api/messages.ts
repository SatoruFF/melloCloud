import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Variables } from './localVariables';

const url = Variables.Message_URL;

export const messageApi = createApi({
  reducerPath: 'messageApi',
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
    sendMessage: builder.mutation<any, any>({
      query: body => ({
        url: 'message',
        method: 'POST',
        body,
      }),
    }),
    deleteMessage: builder.mutation<any, any>({
      query: ({ messageId }) => ({
        url: `message/delete?id=${messageId}`,
        method: 'DELETE',
      }),
    }),
    getMessages: builder.query<any, any>({
      query: (chatId: string) => `message?chatId=${chatId}`,
    }),
    editMessage: builder.mutation<any, any>({
      query: ({ messageId, newText }) => ({
        url: `message/edit`,
        method: 'PUT',
        body: { messageId, newText },
      }),
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation, useDeleteMessageMutation, useEditMessageMutation } =
  messageApi;
