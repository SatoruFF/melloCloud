import type { StateSchema } from '../../../../app/store';

export const getChats = (state: StateSchema) => state.chat.allChats;
export const getCurrentChat = (state: StateSchema) => state.chat.currentChat;
export const getChatById = (state: StateSchema, chatId: string) => state.chat.allChats.find(chat => chat.id === chatId);
