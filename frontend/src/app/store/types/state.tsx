import type { ChatSchema } from "../../../entities/chat";
import { chatApi } from "../../../entities/chat/model/api/chatApi";
import type { FileListSchema } from "../../../entities/file";
import { fileApi } from "../../../entities/file/model/api/fileApi";
import type { MessageSchema } from "../../../entities/message";
import { messageApi } from "../../../entities/message/model/api/messagesApi";
import { taskApi } from "../../../entities/task/model/api/taskApi";
import { TaskState } from "../../../entities/task/types/taskState";
import { taskColumnApi } from "../../../entities/taskColumn/model/api/taskColumnApi";
import { TaskColumnState } from "../../../entities/taskColumn/types/taskColumnState";
import type { UserSchema } from "../../../entities/user";
import { userApi } from "../../../entities/user/model/api/user";
import type { IRestoreScroll } from "../../../features/restoreScroll";

export interface StateSchema {
  user: UserSchema;
  files: FileListSchema;
  messages: MessageSchema;
  chat: ChatSchema;
  ui: IRestoreScroll;

  // Use proper slice state types instead of raw data types
  tasks: TaskState; // Changed from tasks: Task[] to task: TaskState
  taskColumns: TaskColumnState; // Changed from taskColumn: TaskColumn to column: TaskColumnState

  // RTK Query API slices
  [userApi.reducerPath]: ReturnType<typeof userApi.reducer>;
  [fileApi.reducerPath]: ReturnType<typeof fileApi.reducer>;
  [messageApi.reducerPath]: ReturnType<typeof messageApi.reducer>;
  [chatApi.reducerPath]: ReturnType<typeof chatApi.reducer>;
  [taskApi.reducerPath]: ReturnType<typeof taskApi.reducer>;
  [taskColumnApi.reducerPath]: ReturnType<typeof taskColumnApi.reducer>;
}

// #[allow(dead_code)] ;)
export type StateSchemaKey = keyof StateSchema;
