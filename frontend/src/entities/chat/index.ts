import { useGetChatsQuery } from './model/api/chatApi';
import { getCurrentChat } from './model/selector/getChats';
import chatReducer from './model/slice/chatSlice';
import type { ChatSchema } from './types/chat';

export { useGetChatsQuery, getCurrentChat, chatReducer, type ChatSchema };
