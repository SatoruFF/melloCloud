import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { ChatSchema } from "../../types/chat";

const initialState: ChatSchema = {
  allChats: [],
  currentChat: null,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<ChatSchema["currentChat"]>) => {
      state.currentChat = action.payload || null;
    },
  },
});

export const { setCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;
