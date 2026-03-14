import { useGetChatsQuery, useCreateGroupChatMutation } from './model/api/chatApi';
import { getCurrentChat } from './model/selector/getChats';
import chatReducer from './model/slice/chatSlice';
import type { ChatSchema } from './types/chat';

export {
  useGetChatsQuery,
  useCreateGroupChatMutation,
  getCurrentChat,
  chatReducer,
  type ChatSchema,
};

// API Types
export type { Chat, Receiver, CreateGroupChatRequest } from './model/api/chatApi';
