import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import userReducer from './reducers/userSlice';
import fileReducer from './reducers/fileSlice';
import messagesReducer from './reducers/messagesSlice';
import { userApi } from '../../shared/api/user';
import { fileApi } from '../../shared/api/file';
import { messageApi } from '../../shared/api/messages';

export const store = configureStore({
  reducer: {
    users: userReducer,
    files: fileReducer,
    messages: messagesReducer,
    [userApi.reducerPath]: userApi.reducer,
    [fileApi.reducerPath]: fileApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(userApi.middleware, fileApi.middleware),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
