import { useGetChatsQuery } from "./model/api/chatApi";
import chatReducer from "./model/slice/chatSlice";
import type { ChatSchema } from "./types/chat";

export { useGetChatsQuery, chatReducer, type ChatSchema };
