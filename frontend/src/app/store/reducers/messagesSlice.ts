import { createSlice } from '@reduxjs/toolkit';

export interface MessageInterface {
  messages: any[];
  currentChat: any;
  chatStack: number[] | [];
  view: string;
  paths: any[];
}

const initialState: MessageInterface = {
  messages: [],
  currentChat: null,
  chatStack: [],
  view: 'list',
  paths: [{ title: 'Root' }],
};

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setChat: (state, action) => {
      state.currentChat = action.payload;
    },
    addNewMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setMessages, setChat, addNewMessage } = messageSlice.actions;
export default messageSlice.reducer;
