import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../app/store';

// Base selector
const getMessageState = (state: RootState) => state.messages;

// Messages selectors
export const getMessagesSelector = createSelector([getMessageState], messageState => messageState.messages);

export const getCurrentChatSelector = createSelector([getMessageState], messageState => messageState.currentChat);

export const getChatStackSelector = createSelector([getMessageState], messageState => messageState.chatStack);

export const getMessageViewSelector = createSelector([getMessageState], messageState => messageState.view);

export const getMessagePathsSelector = createSelector([getMessageState], messageState => messageState.paths);

// Derived selectors
export const getCurrentChatMessagesSelector = createSelector(
  [getMessagesSelector, getCurrentChatSelector],
  (messages, currentChat) => {
    if (!currentChat) return [];
    return messages.filter(msg => msg.chatId === currentChat.id);
  },
);

export const getMessagesByChatIdSelector = (chatId: string | number) =>
  createSelector([getMessagesSelector], messages => messages.filter(msg => msg.chatId === chatId));
