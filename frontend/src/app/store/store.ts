import { type ReducersMapObject, configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { rtkApi } from '../../shared';
import { fileReducer } from '../../entities/file';
import { messagesReducer } from '../../entities/message';
import { userApi, userReducer } from '../../entities/user';
import { restoreScrollReducer } from '../../features/restoreScroll';
import type { StateSchema } from './types/state';
import { chatReducer } from '../../entities/chat';
import { taskReducer } from '../../entities/task';
import { taskColumnReducer } from '../../entities/taskColumn';
import { noteReducer } from '../../entities/note';
import { eventReducer } from '../../entities/event';
import { webhookReducer } from '../../entities/webhooks';

const rootReducers: ReducersMapObject<StateSchema> = {
  user: userReducer,
  files: fileReducer,
  messages: messagesReducer,
  chat: chatReducer,
  ui: restoreScrollReducer,
  tasks: taskReducer,
  taskColumns: taskColumnReducer,
  notes: noteReducer,
  events: eventReducer,
  webhooks: webhookReducer,

  // ✅ One reducerPath for all API
  [rtkApi.reducerPath]: rtkApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
};

export const store = configureStore({
  reducer: rootReducers,
  // ✅ One middleware for all API with path "api"
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(rtkApi.middleware, userApi.middleware),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
