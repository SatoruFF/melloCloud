import { ReducersMapObject, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import fileReducer from '../../entities/file/model/slice/fileSlice';
import { restoreScrollReducer } from '../../features/restoreScroll';
import { fileApi } from '../../shared/api/file';
import { messageApi } from '../../shared/api/messages';
import { userApi } from '../../shared/api/user';
import messagesReducer from '../../entities/message/model/slice/messagesSlice';
import userReducer from '../../entities/user/model/slice/userSlice';
import { StateSchema } from './types/state';

const rootReducers: ReducersMapObject<StateSchema> = {
  user: userReducer,
  files: fileReducer,
  messages: messagesReducer,
  [userApi.reducerPath]: userApi.reducer,
  [fileApi.reducerPath]: fileApi.reducer,
  [messageApi.reducerPath]: messageApi.reducer,
  ui: restoreScrollReducer,
};

export const store = configureStore({
  reducer: rootReducers,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(userApi.middleware, fileApi.middleware),
});
// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
