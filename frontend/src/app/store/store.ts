import { type ReducersMapObject, configureStore } from "@reduxjs/toolkit";
import {
	type TypedUseSelectorHook,
	useDispatch,
	useSelector,
} from "react-redux";

import { fileApi } from "../../entities/file/model/api/fileApi";
import fileReducer from "../../entities/file/model/slice/fileSlice";
import { messageApi } from "../../entities/message/model/api/messagesApi";
import messagesReducer from "../../entities/message/model/slice/messagesSlice";
import { userApi } from "../../entities/user/model/api/user";
import userReducer from "../../entities/user/model/slice/userSlice";
import { restoreScrollReducer } from "../../features/restoreScroll";
import type { StateSchema } from "./types/state";

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
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(userApi.middleware, fileApi.middleware),
});
// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
