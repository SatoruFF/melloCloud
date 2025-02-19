import { FileSchema } from '../../../entities/file';
import { MessageSchema } from '../../../entities/message';
import { UserSchema } from '../../../entities/user';
import { fileApi } from '../../../shared/api/file';
import { messageApi } from '../../../shared/api/messages';
import { userApi } from '../../../shared/api/user';

export interface StateSchema {
  users: UserSchema; // Тип для состояния пользователей
  files: FileSchema; // Тип для состояния файлов
  messages: MessageSchema; // Тип для состояния сообщений
  [userApi.reducerPath]: ReturnType<typeof userApi.reducer>; // Тип для API пользователей
  [fileApi.reducerPath]: ReturnType<typeof fileApi.reducer>; // Тип для API файлов
  [messageApi.reducerPath]: ReturnType<typeof messageApi.reducer>; // Тип для API сообщений
}

// #[allow(dead_code)] ;)
export type StateSchemaKey = keyof StateSchema;
