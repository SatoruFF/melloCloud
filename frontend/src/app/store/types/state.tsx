import type { FileListSchema } from "../../../entities/file";
import { fileApi } from "../../../entities/file/model/api/fileApi";
import type { MessageSchema } from "../../../entities/message";
import { messageApi } from "../../../entities/message/model/api/messagesApi";
import type { UserSchema } from "../../../entities/user";
import { userApi } from "../../../entities/user/model/api/user";
import type { IRestoreScroll } from "../../../features/restoreScroll";

export interface StateSchema {
	user: UserSchema; // Тип для состояния пользователей
	files: FileListSchema; // Тип для состояния файлов
	messages: MessageSchema; // Тип для состояния сообщений
	[userApi.reducerPath]: ReturnType<typeof userApi.reducer>; // Тип для API пользователей
	[fileApi.reducerPath]: ReturnType<typeof fileApi.reducer>; // Тип для API файлов
	[messageApi.reducerPath]: ReturnType<typeof messageApi.reducer>; // Тип для API сообщений,
	ui: IRestoreScroll;
}

// #[allow(dead_code)] ;)
export type StateSchemaKey = keyof StateSchema;
